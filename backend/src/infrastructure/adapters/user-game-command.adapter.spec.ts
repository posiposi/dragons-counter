import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { UserGameCommandAdapter } from './user-game-command.adapter';
import { UserGame } from '../../domain/entities/user-game';
import { UserId } from '../../domain/value-objects/user-id';
import { GameId } from '../../domain/value-objects/game-id';
import { Impression } from '../../domain/value-objects/impression';
import { UserGameAlreadyExistsException } from '../../domain/exceptions/user-game-already-exists.exception';
import { UserGameEntity } from '../typeorm/entities/user-game.entity';
import { UserEntity } from '../typeorm/entities/user.entity';
import { GameEntity } from '../typeorm/entities/game.entity';
import { StadiumEntity } from '../typeorm/entities/stadium.entity';
import { UserRegistrationRequestEntity } from '../typeorm/entities/user-registration-request.entity';
import { GameResultEnum } from '../typeorm/enums/game-result.enum';
import { UserRoleEnum } from '../typeorm/enums/user-role.enum';
import { createDataSourceOptions } from '../typeorm/data-source';

describe('UserGameCommandAdapter', () => {
  let module: TestingModule;
  let adapter: UserGameCommandAdapter;
  let userGameRepository: Repository<UserGameEntity>;
  let userRepository: Repository<UserEntity>;
  let gameRepository: Repository<GameEntity>;
  let stadiumRepository: Repository<StadiumEntity>;
  let dataSource: DataSource;

  const testPrefix = 'ug-cmd-adapter-';
  let testUserId: string;
  let testGameId: string;
  let testStadiumId: string;

  beforeAll(async () => {
    const dataSourceOptions = createDataSourceOptions(
      process.env.DATABASE_URL ?? '',
    );

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dataSourceOptions),
        TypeOrmModule.forFeature([
          UserGameEntity,
          UserEntity,
          GameEntity,
          StadiumEntity,
          UserRegistrationRequestEntity,
        ]),
      ],
      providers: [UserGameCommandAdapter],
    }).compile();

    userGameRepository = module.get<Repository<UserGameEntity>>(
      getRepositoryToken(UserGameEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    gameRepository = module.get<Repository<GameEntity>>(
      getRepositoryToken(GameEntity),
    );
    stadiumRepository = module.get<Repository<StadiumEntity>>(
      getRepositoryToken(StadiumEntity),
    );
    adapter = module.get<UserGameCommandAdapter>(UserGameCommandAdapter);
    dataSource = module.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    testStadiumId = randomUUID();
    testUserId = randomUUID();
    testGameId = randomUUID();

    await stadiumRepository.save({
      id: testStadiumId,
      name: `${testPrefix}stadium-${testStadiumId}`,
    });

    await userRepository.save({
      id: testUserId,
      email: `${testPrefix}${testUserId}@example.com`,
      password: 'hashed_password',
      role: UserRoleEnum.USER,
    });

    await gameRepository.save({
      id: testGameId,
      gameDate: new Date('2025-06-01T18:00:00'),
      opponent: 'Test Opponent',
      dragonsScore: 3,
      opponentScore: 1,
      result: GameResultEnum.WIN,
      stadiumId: testStadiumId,
    });
  });

  const cleanupTestData = async () => {
    await dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .delete()
        .from(UserGameEntity)
        .where('userId = :userId', { userId: testUserId })
        .execute();
      await manager
        .createQueryBuilder()
        .delete()
        .from(UserRegistrationRequestEntity)
        .where('userId = :userId', { userId: testUserId })
        .execute();
      await manager
        .createQueryBuilder()
        .delete()
        .from(UserEntity)
        .where('email LIKE :prefix', { prefix: `${testPrefix}%` })
        .execute();
      await manager
        .createQueryBuilder()
        .delete()
        .from(GameEntity)
        .where('id = :id', { id: testGameId })
        .execute();
      await manager
        .createQueryBuilder()
        .delete()
        .from(StadiumEntity)
        .where('name LIKE :prefix', { prefix: `${testPrefix}%` })
        .execute();
    });
  };

  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await module.close();
  });

  describe('save', () => {
    it('新規の観戦記録を保存してドメインエンティティを返す', async () => {
      const userId = UserId.create(testUserId);
      const gameId = new GameId(testGameId);
      const impression = Impression.create('良い試合だった');
      const userGame = UserGame.createNew(userId, gameId, impression);

      const result = await adapter.save(userGame);

      expect(result).toBeInstanceOf(UserGame);
      expect(result.id.value).toBe(userGame.id.value);
      expect(result.userId.value).toBe(testUserId);
      expect(result.gameId.value).toBe(testGameId);
      expect(result.impression?.value).toBe('良い試合だった');

      const saved = await userGameRepository.findOne({
        where: { id: userGame.id.value },
      });
      expect(saved).not.toBeNull();
      expect(saved?.userId).toBe(testUserId);
      expect(saved?.gameId).toBe(testGameId);
      expect(saved?.impression).toBe('良い試合だった');
    });

    it('感想なしの観戦記録を保存できる', async () => {
      const userId = UserId.create(testUserId);
      const gameId = new GameId(testGameId);
      const userGame = UserGame.createNew(userId, gameId);

      const result = await adapter.save(userGame);

      expect(result).toBeInstanceOf(UserGame);
      expect(result.impression).toBeNull();

      const saved = await userGameRepository.findOne({
        where: { id: userGame.id.value },
      });
      expect(saved?.impression).toBeNull();
    });

    it('ユニーク制約違反時にUserGameAlreadyExistsExceptionがスローされる', async () => {
      const userId = UserId.create(testUserId);
      const gameId = new GameId(testGameId);
      const userGame = UserGame.createNew(userId, gameId);

      await adapter.save(userGame);

      const duplicateUserGame = UserGame.createNew(userId, gameId);

      jest
        .spyOn(userGameRepository, 'findOne')
        .mockResolvedValueOnce(null as unknown as UserGameEntity);

      await expect(adapter.save(duplicateUserGame)).rejects.toThrow(
        UserGameAlreadyExistsException,
      );

      jest.restoreAllMocks();
    });

    it('既存の観戦記録を更新できる', async () => {
      const userId = UserId.create(testUserId);
      const gameId = new GameId(testGameId);
      const userGame = UserGame.createNew(userId, gameId);

      await adapter.save(userGame);

      const updatedUserGame = userGame.updateImpression(
        Impression.create('更新後の感想'),
      );
      const result = await adapter.save(updatedUserGame);

      expect(result.impression?.value).toBe('更新後の感想');

      const saved = await userGameRepository.findOne({
        where: { id: userGame.id.value },
      });
      expect(saved?.impression).toBe('更新後の感想');
    });
  });

  describe('softDelete', () => {
    it('指定したuserId・gameIdの観戦記録を論理削除する', async () => {
      const userId = UserId.create(testUserId);
      const gameId = new GameId(testGameId);
      const userGame = UserGame.createNew(userId, gameId);

      await adapter.save(userGame);

      await adapter.softDelete(userId, gameId);

      const found = await userGameRepository.findOne({
        where: { id: userGame.id.value },
      });
      expect(found).toBeNull();

      const foundWithDeleted = await userGameRepository.findOne({
        where: { id: userGame.id.value },
        withDeleted: true,
      });
      expect(foundWithDeleted).not.toBeNull();
      expect(foundWithDeleted?.deletedAt).not.toBeNull();
    });

    it('該当レコードが存在しない場合でもエラーにならない', async () => {
      const userId = UserId.create(randomUUID());
      const gameId = new GameId(randomUUID());

      await expect(adapter.softDelete(userId, gameId)).resolves.not.toThrow();
    });

    it('論理削除後に同じユーザー・試合で再登録できる', async () => {
      const userId = UserId.create(testUserId);
      const gameId = new GameId(testGameId);
      const userGame = UserGame.createNew(userId, gameId);

      await adapter.save(userGame);
      await adapter.softDelete(userId, gameId);

      const newUserGame = UserGame.createNew(
        userId,
        gameId,
        Impression.create('再登録の感想'),
      );
      const result = await adapter.save(newUserGame);

      expect(result).toBeInstanceOf(UserGame);
      expect(result.userId.value).toBe(testUserId);
      expect(result.gameId.value).toBe(testGameId);
      expect(result.impression?.value).toBe('再登録の感想');

      const found = await userGameRepository.findOne({
        where: { userId: testUserId, gameId: testGameId },
      });
      expect(found).not.toBeNull();
      expect(found?.deletedAt).toBeNull();
      expect(found?.id).toBe(userGame.id.value);
    });
  });
});

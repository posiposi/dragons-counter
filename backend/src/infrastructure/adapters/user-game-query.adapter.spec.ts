import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { UserGameQueryAdapter } from './user-game-query.adapter';
import { UserGame } from '../../domain/entities/user-game';
import { UserId } from '../../domain/value-objects/user-id';
import { GameId } from '../../domain/value-objects/game-id';
import { UserGameEntity } from '../typeorm/entities/user-game.entity';
import { UserEntity } from '../typeorm/entities/user.entity';
import { GameEntity } from '../typeorm/entities/game.entity';
import { StadiumEntity } from '../typeorm/entities/stadium.entity';
import { UserRegistrationRequestEntity } from '../typeorm/entities/user-registration-request.entity';
import { UserRoleEnum } from '../typeorm/enums/user-role.enum';
import { GameResultEnum } from '../typeorm/enums/game-result.enum';
import { createDataSourceOptions } from '../typeorm/data-source';

describe('UserGameQueryAdapter 統合テスト', () => {
  let module: TestingModule;
  let userGameRepository: Repository<UserGameEntity>;
  let userRepository: Repository<UserEntity>;
  let gameRepository: Repository<GameEntity>;
  let stadiumRepository: Repository<StadiumEntity>;
  let adapter: UserGameQueryAdapter;
  let dataSource: DataSource;

  const testPrefix = 'ug-query-adapter-';

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
      providers: [UserGameQueryAdapter],
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
    adapter = module.get<UserGameQueryAdapter>(UserGameQueryAdapter);
    dataSource = module.get<DataSource>(DataSource);
  });

  const createTestStadium = async (): Promise<string> => {
    const stadiumId = randomUUID();
    const stadium = stadiumRepository.create({
      id: stadiumId,
      name: `${testPrefix}stadium-${stadiumId}`,
    });
    await stadiumRepository.save(stadium);
    return stadiumId;
  };

  const createTestUser = async (): Promise<string> => {
    const userId = randomUUID();
    const user = userRepository.create({
      id: userId,
      email: `${testPrefix}${userId}@example.com`,
      password: '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12',
      role: UserRoleEnum.USER,
    });
    await userRepository.save(user);
    return userId;
  };

  const createTestGame = async (stadiumId: string): Promise<string> => {
    const gameId = randomUUID();
    const game = gameRepository.create({
      id: gameId,
      gameDate: new Date('2025-06-01T18:00:00Z'),
      opponent: 'テスト球団',
      dragonsScore: 3,
      opponentScore: 1,
      result: GameResultEnum.WIN,
      stadiumId,
    });
    await gameRepository.save(game);
    return gameId;
  };

  const cleanupTestData = async () => {
    await dataSource.transaction(async (manager) => {
      const ugRepo = manager.getRepository(UserGameEntity);
      const userRepo = manager.getRepository(UserEntity);
      const gameRepo = manager.getRepository(GameEntity);
      const stadiumRepo = manager.getRepository(StadiumEntity);

      const testUsers = await userRepo
        .createQueryBuilder('u')
        .select('u.id')
        .where('u.email LIKE :prefix', { prefix: `${testPrefix}%` })
        .getMany();
      const userIds = testUsers.map((u) => u.id);

      if (userIds.length > 0) {
        await ugRepo
          .createQueryBuilder()
          .delete()
          .where('user_id IN (:...userIds)', { userIds })
          .execute();
      }

      await userRepo
        .createQueryBuilder()
        .delete()
        .where('email LIKE :prefix', { prefix: `${testPrefix}%` })
        .execute();

      const testStadiums = await stadiumRepo
        .createQueryBuilder('s')
        .select('s.id')
        .where('s.name LIKE :prefix', { prefix: `${testPrefix}%` })
        .getMany();
      const stadiumIds = testStadiums.map((s) => s.id);

      if (stadiumIds.length > 0) {
        await gameRepo
          .createQueryBuilder()
          .delete()
          .where('stadium_id IN (:...stadiumIds)', { stadiumIds })
          .execute();
        await stadiumRepo
          .createQueryBuilder()
          .delete()
          .where('id IN (:...stadiumIds)', { stadiumIds })
          .execute();
      }
    });
  };

  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await module.close();
  });

  describe('findByUserId', () => {
    it('ユーザーIDに紐づくUserGameの一覧を返す', async () => {
      const stadiumId = await createTestStadium();
      const userId = await createTestUser();
      const gameId1 = await createTestGame(stadiumId);
      const gameId2 = await createTestGame(stadiumId);

      const userGameId1 = randomUUID();
      const userGameId2 = randomUUID();
      await userGameRepository.save([
        userGameRepository.create({
          id: userGameId1,
          userId,
          gameId: gameId1,
          impression: '楽しかった',
        }),
        userGameRepository.create({
          id: userGameId2,
          userId,
          gameId: gameId2,
          impression: null,
        }),
      ]);

      const result = await adapter.findByUserId(UserId.create(userId));

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserGame);
      expect(result[1]).toBeInstanceOf(UserGame);

      const ids = result.map((ug) => ug.id.value).sort();
      expect(ids).toEqual([userGameId1, userGameId2].sort());
    });

    it('該当データが存在しない場合に空配列を返す', async () => {
      const result = await adapter.findByUserId(UserId.create(randomUUID()));

      expect(result).toEqual([]);
    });
  });

  describe('findByUserIdAndGameId', () => {
    it('ユーザーIDとゲームIDに一致するUserGameを返す', async () => {
      const stadiumId = await createTestStadium();
      const userId = await createTestUser();
      const gameId = await createTestGame(stadiumId);
      const userGameId = randomUUID();

      await userGameRepository.save(
        userGameRepository.create({
          id: userGameId,
          userId,
          gameId,
          impression: '最高の試合',
        }),
      );

      const result = await adapter.findByUserIdAndGameId(
        UserId.create(userId),
        new GameId(gameId),
      );

      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(UserGame);
      expect(result?.id.value).toBe(userGameId);
      expect(result?.userId.value).toBe(userId);
      expect(result?.gameId.value).toBe(gameId);
      expect(result?.impression?.value).toBe('最高の試合');
    });

    it('該当データが存在しない場合にnullを返す', async () => {
      const result = await adapter.findByUserIdAndGameId(
        UserId.create(randomUUID()),
        new GameId(randomUUID()),
      );

      expect(result).toBeNull();
    });
  });
});

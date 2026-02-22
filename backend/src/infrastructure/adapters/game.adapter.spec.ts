import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GameAdapter } from './game.adapter';
import { Game } from '../../domain/entities/game';
import { GameId } from '../../domain/value-objects/game-id';
import { Score } from '../../domain/value-objects/score';
import { Opponent } from '../../domain/value-objects/opponent';
import { Stadium } from '../../domain/value-objects/stadium';
import { StadiumId } from '../../domain/value-objects/stadium-id';
import { StadiumName } from '../../domain/value-objects/stadium-name';
import { Notes } from '../../domain/value-objects/notes';
import { GameDate } from '../../domain/value-objects/game-date';
import { GameResultValue } from '../../domain/value-objects/game-result';
import { GameEntity } from '../typeorm/entities/game.entity';
import { StadiumEntity } from '../typeorm/entities/stadium.entity';
import { GameResultEnum } from '../typeorm/enums/game-result.enum';
import { createDataSourceOptions } from '../typeorm/data-source';
import { randomUUID } from 'crypto';

describe('GameAdapter Integration Tests', () => {
  let module: TestingModule;
  let gameRepository: Repository<GameEntity>;
  let stadiumRepository: Repository<StadiumEntity>;

  // 固定のスタジアムID（game.adapter専用）
  const testStadiums = {
    vantelin: {
      id: '33333333-game-0001-0001-000000000001',
      name: 'バンテリンドーム_game',
    },
    koshien: {
      id: '33333333-game-0001-0001-000000000002',
      name: '甲子園_game',
    },
    mazda: {
      id: '33333333-game-0001-0001-000000000003',
      name: 'マツダスタジアム_game',
    },
  };

  const createTestGame = (
    overrides: Partial<GameEntity> & { id: string; stadiumId: string },
  ): GameEntity => {
    const now = new Date();
    return gameRepository.create({
      gameDate: now,
      opponent: 'テスト対戦相手',
      dragonsScore: 0,
      opponentScore: 0,
      result: GameResultEnum.DRAW,
      notes: null,
      ...overrides,
    });
  };

  beforeAll(async () => {
    const dataSourceOptions = createDataSourceOptions(
      process.env.DATABASE_URL ?? '',
    );

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dataSourceOptions),
        TypeOrmModule.forFeature([GameEntity, StadiumEntity]),
      ],
      providers: [GameAdapter],
    }).compile();

    gameRepository = module.get<Repository<GameEntity>>(
      getRepositoryToken(GameEntity),
    );
    stadiumRepository = module.get<Repository<StadiumEntity>>(
      getRepositoryToken(StadiumEntity),
    );

    // スタジアムをupsertで作成（並列実行でもCIエラーにならないように）
    for (const stadium of Object.values(testStadiums)) {
      await stadiumRepository.save(
        stadiumRepository.create({
          id: stadium.id,
          name: stadium.name,
        }),
      );
    }
  });

  afterAll(async () => {
    const stadiumIds = Object.values(testStadiums).map((s) => s.id);
    await gameRepository
      .createQueryBuilder()
      .delete()
      .where('stadiumId IN (:...ids)', { ids: stadiumIds })
      .execute();
    await stadiumRepository
      .createQueryBuilder()
      .delete()
      .where('id IN (:...ids)', { ids: stadiumIds })
      .execute();
    await module.close();
  });

  describe('save', () => {
    afterEach(async () => {
      const stadiumIds = Object.values(testStadiums).map((s) => s.id);
      await gameRepository
        .createQueryBuilder()
        .delete()
        .where('stadiumId IN (:...ids)', { ids: stadiumIds })
        .execute();
    });

    it('should save a game with WIN result and notes', async () => {
      const gameId = new GameId(randomUUID());
      const stadium = Stadium.create(
        StadiumId.create(testStadiums.vantelin.id),
        StadiumName.create(testStadiums.vantelin.name),
      );
      const game = new Game(
        gameId,
        new GameDate(new Date('2024-04-01')),
        new Opponent('横浜DeNAベイスターズ'),
        new Score(5),
        new Score(3),
        stadium,
        new Notes('開幕戦で勝利！'),
        new Date('2024-04-01'),
        new Date('2024-04-01'),
      );

      const adapter = module.get<GameAdapter>(GameAdapter);
      const result = await adapter.save(game);

      expect(result).toBeInstanceOf(Game);
      expect(result.id.value).toBe(gameId.value);
      expect(result.stadium.id.value).toBe(testStadiums.vantelin.id);
      expect(result.stadium.name.value).toBe(testStadiums.vantelin.name);
      expect(result.result.value).toBe(GameResultValue.WIN);

      const savedGame = await gameRepository.findOne({
        where: { id: gameId.value },
      });

      expect(savedGame).not.toBeNull();
      expect(savedGame?.stadiumId).toBe(testStadiums.vantelin.id);
    });

    it('should save a game with LOSE result', async () => {
      const gameId = new GameId(randomUUID());
      const stadium = Stadium.create(
        StadiumId.create(testStadiums.koshien.id),
        StadiumName.create(testStadiums.koshien.name),
      );
      const game = new Game(
        gameId,
        new GameDate(new Date('2024-04-02')),
        new Opponent('阪神タイガース'),
        new Score(2),
        new Score(7),
        stadium,
        new Notes('大敗'),
        new Date('2024-04-02'),
        new Date('2024-04-02'),
      );

      const adapter = module.get<GameAdapter>(GameAdapter);
      const result = await adapter.save(game);

      expect(result.stadium.id.value).toBe(testStadiums.koshien.id);
      expect(result.stadium.name.value).toBe(testStadiums.koshien.name);
      expect(result.result.value).toBe(GameResultValue.LOSE);
    });

    it('should save a game with DRAW result', async () => {
      const gameId = new GameId(randomUUID());
      const stadium = Stadium.create(
        StadiumId.create(testStadiums.mazda.id),
        StadiumName.create(testStadiums.mazda.name),
      );
      const game = new Game(
        gameId,
        new GameDate(new Date('2024-04-03')),
        new Opponent('広島東洋カープ'),
        new Score(4),
        new Score(4),
        stadium,
        new Notes('引き分け'),
        new Date('2024-04-03'),
        new Date('2024-04-03'),
      );

      const adapter = module.get<GameAdapter>(GameAdapter);
      const result = await adapter.save(game);

      expect(result.stadium.id.value).toBe(testStadiums.mazda.id);
      expect(result.stadium.name.value).toBe(testStadiums.mazda.name);
      expect(result.result.value).toBe(GameResultValue.DRAW);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      const stadiumIds = Object.values(testStadiums).map((s) => s.id);
      await gameRepository
        .createQueryBuilder()
        .delete()
        .where('stadiumId IN (:...ids)', { ids: stadiumIds })
        .execute();
    });

    afterEach(async () => {
      const stadiumIds = Object.values(testStadiums).map((s) => s.id);
      await gameRepository
        .createQueryBuilder()
        .delete()
        .where('stadiumId IN (:...ids)', { ids: stadiumIds })
        .execute();
    });

    it('should return all games ordered by gameDate desc with stadium info', async () => {
      const game1Id = randomUUID();
      const game2Id = randomUUID();

      await gameRepository.save(
        createTestGame({
          id: game1Id,
          gameDate: new Date('2024-04-01'),
          opponent: '横浜DeNAベイスターズ',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultEnum.WIN,
          notes: '開幕戦で勝利！',
        }),
      );

      await gameRepository.save(
        createTestGame({
          id: game2Id,
          gameDate: new Date('2024-04-03'),
          opponent: '阪神タイガース',
          stadiumId: testStadiums.koshien.id,
          dragonsScore: 2,
          opponentScore: 7,
          result: GameResultEnum.LOSE,
          notes: '大敗',
        }),
      );

      const adapter = module.get<GameAdapter>(GameAdapter);
      const result = await adapter.findAll();

      // 他テストスイートのデータが混入する可能性があるため、自テストのデータのみフィルタして検証
      const stadiumIds = Object.values(testStadiums).map((s) => s.id);
      const ownGames = result.filter((g) =>
        stadiumIds.includes(g.stadium.id.value),
      );

      expect(ownGames).toHaveLength(2);
      expect(ownGames[0]).toBeInstanceOf(Game);

      // 日付降順で2番目の試合が最初に来る
      expect(ownGames[0].gameDate.value).toEqual(new Date('2024-04-03'));
      expect(ownGames[0].opponent.value).toBe('阪神タイガース');
      expect(ownGames[0].stadium.id.value).toBe(testStadiums.koshien.id);
      expect(ownGames[0].stadium.name.value).toBe(testStadiums.koshien.name);
      expect(ownGames[0].dragonsScore.value).toBe(2);
      expect(ownGames[0].opponentScore.value).toBe(7);
      expect(ownGames[0].result.value).toBe(GameResultValue.LOSE);
      expect(ownGames[0].notes?.value).toBe('大敗');

      expect(ownGames[1].gameDate.value).toEqual(new Date('2024-04-01'));
      expect(ownGames[1].opponent.value).toBe('横浜DeNAベイスターズ');
      expect(ownGames[1].stadium.id.value).toBe(testStadiums.vantelin.id);
      expect(ownGames[1].stadium.name.value).toBe(testStadiums.vantelin.name);
      expect(ownGames[1].result.value).toBe(GameResultValue.WIN);
    });

    it('should return empty array when no games exist', async () => {
      const adapter = module.get<GameAdapter>(GameAdapter);
      const result = await adapter.findAll();

      // 他テストスイートのデータが混入する可能性があるため、自テストのデータのみフィルタして検証
      const stadiumIds = Object.values(testStadiums).map((s) => s.id);
      const ownGames = result.filter((g) =>
        stadiumIds.includes(g.stadium.id.value),
      );

      expect(ownGames).toEqual([]);
    });

    it('should exclude soft-deleted games', async () => {
      const activeGameId = randomUUID();
      const deletedGameId = randomUUID();

      await gameRepository.save(
        createTestGame({
          id: activeGameId,
          gameDate: new Date('2024-04-01'),
          opponent: '横浜DeNAベイスターズ',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultEnum.WIN,
          notes: 'アクティブな試合',
        }),
      );

      await gameRepository.save(
        createTestGame({
          id: deletedGameId,
          gameDate: new Date('2024-04-02'),
          opponent: '阪神タイガース',
          stadiumId: testStadiums.koshien.id,
          dragonsScore: 2,
          opponentScore: 7,
          result: GameResultEnum.LOSE,
          notes: '削除された試合',
          deletedAt: new Date(),
        }),
      );

      const adapter = module.get<GameAdapter>(GameAdapter);
      const result = await adapter.findAll();

      // 他テストスイートのデータが混入する可能性があるため、自テストのデータのみフィルタして検証
      const stadiumIds = Object.values(testStadiums).map((s) => s.id);
      const ownGames = result.filter((g) =>
        stadiumIds.includes(g.stadium.id.value),
      );

      expect(ownGames).toHaveLength(1);
      expect(ownGames[0].id.value).toBe(activeGameId);
      expect(ownGames[0].opponent.value).toBe('横浜DeNAベイスターズ');
      expect(ownGames[0].stadium.id.value).toBe(testStadiums.vantelin.id);
    });
  });

  describe('findById and softDelete', () => {
    let testGameId: string;
    let testGameIdVO: GameId;
    let nonExistentGameIdVO: GameId;
    let adapter: GameAdapter;

    beforeEach(async () => {
      const stadiumIds = Object.values(testStadiums).map((s) => s.id);
      await gameRepository
        .createQueryBuilder()
        .delete()
        .where('stadiumId IN (:...ids)', { ids: stadiumIds })
        .execute();

      testGameId = '33333333-game-test-0001-000000000001';
      testGameIdVO = new GameId(testGameId);
      nonExistentGameIdVO = new GameId('123e4567-e89b-12d3-a456-426614174999');
      adapter = module.get<GameAdapter>(GameAdapter);

      await gameRepository.save(
        createTestGame({
          id: testGameId,
          gameDate: new Date('2024-04-01'),
          opponent: '横浜DeNAベイスターズ',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultEnum.WIN,
          notes: 'テスト試合',
        }),
      );
    });

    afterEach(async () => {
      const stadiumIds = Object.values(testStadiums).map((s) => s.id);
      await gameRepository
        .createQueryBuilder()
        .delete()
        .where('stadiumId IN (:...ids)', { ids: stadiumIds })
        .execute();
    });

    describe('findById', () => {
      it('should return a game with stadium info when it exists', async () => {
        const result = await adapter.findById(testGameIdVO);

        expect(result).not.toBeNull();
        expect(result?.id.value).toBe(testGameId);
        expect(result?.opponent.value).toBe('横浜DeNAベイスターズ');
        expect(result?.dragonsScore.value).toBe(5);
        expect(result?.result.value).toBe(GameResultValue.WIN);
        expect(result?.stadium.id.value).toBe(testStadiums.vantelin.id);
        expect(result?.stadium.name.value).toBe(testStadiums.vantelin.name);
      });

      it('should return null when game does not exist', async () => {
        const result = await adapter.findById(nonExistentGameIdVO);

        expect(result).toBeNull();
      });
    });

    describe('softDelete', () => {
      it('should soft-delete an existing game', async () => {
        const result = await adapter.softDelete(testGameIdVO);

        expect(result).toBe(true);

        const deletedGame = await gameRepository.findOne({
          where: { id: testGameId },
          withDeleted: true,
        });
        expect(deletedGame?.deletedAt).not.toBeNull();
      });

      it('should return null for soft-deleted game in findById', async () => {
        await adapter.softDelete(testGameIdVO);

        const result = await adapter.findById(testGameIdVO);
        expect(result).toBeNull();
      });

      it('should return false when soft-deleting already deleted game', async () => {
        await adapter.softDelete(testGameIdVO);

        const result = await adapter.softDelete(testGameIdVO);
        expect(result).toBe(false);
      });

      it('should return false when game does not exist', async () => {
        const result = await adapter.softDelete(nonExistentGameIdVO);

        expect(result).toBe(false);
      });
    });
  });
});

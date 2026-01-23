import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
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
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('GameAdapter Integration Tests', () => {
  let prismaService: PrismaService;
  let module: TestingModule;
  let prismaClient: PrismaClient;

  const testStadiums = {
    vantelin: { id: randomUUID(), name: 'バンテリンドーム' },
    koshien: { id: randomUUID(), name: '甲子園' },
    mazda: { id: randomUUID(), name: 'マツダスタジアム' },
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        GameAdapter,
        PrismaService,
        {
          provide: PrismaClient,
          useExisting: PrismaService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    prismaClient = prismaService;

    await prismaService.game.deleteMany();
    await prismaService.stadium.deleteMany();

    for (const stadium of Object.values(testStadiums)) {
      await prismaService.stadium.create({
        data: {
          id: stadium.id,
          name: stadium.name,
        },
      });
    }
  });

  afterAll(async () => {
    await prismaService.game.deleteMany();
    await prismaService.stadium.deleteMany();
    await prismaService.$disconnect();
    await module.close();
  });

  describe('save', () => {
    it('should save a game with WIN result and notes', async () => {
      try {
        await prismaClient.$transaction(
          async (tx) => {
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

            const adapter = new GameAdapter(tx as PrismaClient);
            const result = await adapter.save(game);

            expect(result).toBeInstanceOf(Game);
            expect(result.id.value).toBe(gameId.value);
            expect(result.stadium.id.value).toBe(testStadiums.vantelin.id);
            expect(result.stadium.name.value).toBe(testStadiums.vantelin.name);
            expect(result.result.value).toBe(GameResultValue.WIN);

            const savedGame = await tx.game.findUnique({
              where: { id: gameId.value },
            });

            expect(savedGame).not.toBeNull();
            expect(savedGame?.stadiumId).toBe(testStadiums.vantelin.id);

            throw new Error('Rollback transaction');
          },
          { maxWait: 5000, timeout: 10000 },
        );
      } catch (error: unknown) {
        expect((error as Error).message).toBe('Rollback transaction');
      }
    });

    it('should save a game with LOSE result', async () => {
      try {
        await prismaClient.$transaction(
          async (tx) => {
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

            const adapter = new GameAdapter(tx as PrismaClient);
            const result = await adapter.save(game);

            expect(result.stadium.id.value).toBe(testStadiums.koshien.id);
            expect(result.stadium.name.value).toBe(testStadiums.koshien.name);
            expect(result.result.value).toBe(GameResultValue.LOSE);

            throw new Error('Rollback transaction');
          },
          { maxWait: 5000, timeout: 10000 },
        );
      } catch (error: unknown) {
        expect((error as Error).message).toBe('Rollback transaction');
      }
    });

    it('should save a game with DRAW result', async () => {
      try {
        await prismaClient.$transaction(
          async (tx) => {
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

            const adapter = new GameAdapter(tx as PrismaClient);
            const result = await adapter.save(game);

            expect(result.stadium.id.value).toBe(testStadiums.mazda.id);
            expect(result.stadium.name.value).toBe(testStadiums.mazda.name);
            expect(result.result.value).toBe(GameResultValue.DRAW);

            throw new Error('Rollback transaction');
          },
          { maxWait: 5000, timeout: 10000 },
        );
      } catch (error: unknown) {
        expect((error as Error).message).toBe('Rollback transaction');
      }
    });
  });

  describe('findAll', () => {
    it('should return all games ordered by gameDate desc with stadium info', async () => {
      await prismaService.game.deleteMany();

      const game1Id = randomUUID();
      const game2Id = randomUUID();

      await prismaService.game.create({
        data: {
          id: game1Id,
          gameDate: new Date('2024-04-01'),
          opponent: '横浜DeNAベイスターズ',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultValue.WIN,
          notes: '開幕戦で勝利！',
        },
      });

      await prismaService.game.create({
        data: {
          id: game2Id,
          gameDate: new Date('2024-04-03'),
          opponent: '阪神タイガース',
          stadiumId: testStadiums.koshien.id,
          dragonsScore: 2,
          opponentScore: 7,
          result: GameResultValue.LOSE,
          notes: '大敗',
        },
      });

      const adapter = new GameAdapter(prismaClient);
      const result = await adapter.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Game);

      // 日付降順で2番目の試合が最初に来る
      expect(result[0].gameDate.value).toEqual(new Date('2024-04-03'));
      expect(result[0].opponent.value).toBe('阪神タイガース');
      expect(result[0].stadium.id.value).toBe(testStadiums.koshien.id);
      expect(result[0].stadium.name.value).toBe(testStadiums.koshien.name);
      expect(result[0].dragonsScore.value).toBe(2);
      expect(result[0].opponentScore.value).toBe(7);
      expect(result[0].result.value).toBe(GameResultValue.LOSE);
      expect(result[0].notes?.value).toBe('大敗');

      expect(result[1].gameDate.value).toEqual(new Date('2024-04-01'));
      expect(result[1].opponent.value).toBe('横浜DeNAベイスターズ');
      expect(result[1].stadium.id.value).toBe(testStadiums.vantelin.id);
      expect(result[1].stadium.name.value).toBe(testStadiums.vantelin.name);
      expect(result[1].result.value).toBe(GameResultValue.WIN);
    });

    it('should return empty array when no games exist', async () => {
      await prismaService.game.deleteMany();

      const adapter = new GameAdapter(prismaClient);
      const result = await adapter.findAll();

      expect(result).toEqual([]);
    });

    it('should exclude soft-deleted games', async () => {
      await prismaService.game.deleteMany();

      const activeGameId = randomUUID();
      const deletedGameId = randomUUID();

      await prismaService.game.create({
        data: {
          id: activeGameId,
          gameDate: new Date('2024-04-01'),
          opponent: '横浜DeNAベイスターズ',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultValue.WIN,
          notes: 'アクティブな試合',
        },
      });

      await prismaService.game.create({
        data: {
          id: deletedGameId,
          gameDate: new Date('2024-04-02'),
          opponent: '阪神タイガース',
          stadiumId: testStadiums.koshien.id,
          dragonsScore: 2,
          opponentScore: 7,
          result: GameResultValue.LOSE,
          notes: '削除された試合',
          deletedAt: new Date(),
        },
      });

      const adapter = new GameAdapter(prismaClient);
      const result = await adapter.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id.value).toBe(activeGameId);
      expect(result[0].opponent.value).toBe('横浜DeNAベイスターズ');
      expect(result[0].stadium.id.value).toBe(testStadiums.vantelin.id);
    });
  });

  describe('findById and softDelete', () => {
    let testGameId: string;
    let testGameIdVO: GameId;
    let nonExistentGameIdVO: GameId;
    let adapter: GameAdapter;

    beforeEach(async () => {
      await prismaService.game.deleteMany();

      testGameId = '123e4567-e89b-12d3-a456-426614174000';
      testGameIdVO = new GameId(testGameId);
      nonExistentGameIdVO = new GameId('123e4567-e89b-12d3-a456-426614174999');
      adapter = new GameAdapter(prismaClient);

      await prismaService.game.create({
        data: {
          id: testGameId,
          gameDate: new Date('2024-04-01'),
          opponent: '横浜DeNAベイスターズ',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultValue.WIN,
          notes: 'テスト試合',
        },
      });
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

        const deletedGame = await prismaService.game.findUnique({
          where: { id: testGameId },
        });
        expect(deletedGame?.deletedAt).not.toBeNull();
      });

      it('should return null for soft-deleted game in findById', async () => {
        await adapter.softDelete(testGameIdVO);

        const result = await adapter.findById(testGameIdVO);
        expect(result).toBeNull();
      });

      it('should return true when soft-deleting already deleted game', async () => {
        await adapter.softDelete(testGameIdVO);

        const result = await adapter.softDelete(testGameIdVO);
        expect(result).toBe(true);
      });

      it('should return false when game does not exist', async () => {
        const result = await adapter.softDelete(nonExistentGameIdVO);

        expect(result).toBe(false);
      });
    });
  });
});

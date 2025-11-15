import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { GameAdapter } from './game.adapter';
import { Game } from '../../domain/entities/game';
import { GameId } from '../../domain/value-objects/game-id';
import { Score } from '../../domain/value-objects/score';
import { Opponent } from '../../domain/value-objects/opponent';
import { Stadium } from '../../domain/value-objects/stadium';
import { Notes } from '../../domain/value-objects/notes';
import { GameDate } from '../../domain/value-objects/game-date';
import { GameResultValue } from '../../domain/value-objects/game-result';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('GameAdapter Integration Tests', () => {
  let prismaService: PrismaService;
  let module: TestingModule;
  let prismaClient: PrismaClient;

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
  });

  afterAll(async () => {
    await prismaService.game.deleteMany();
    await prismaService.$disconnect();
    await module.close();
  });

  describe('save', () => {
    const testCases = [
      {
        description: 'should save a game with WIN result and notes',
        gameData: {
          date: new Date('2024-04-01'),
          opponent: '横浜DeNAベイスターズ',
          stadium: 'バンテリンドーム',
          dragonsScore: 5,
          opponentScore: 3,
          notes: '開幕戦で勝利！',
        },
        expectedResult: GameResultValue.WIN,
      },
      {
        description: 'should save a game with LOSE result',
        gameData: {
          date: new Date('2024-04-02'),
          opponent: '阪神タイガース',
          stadium: '甲子園',
          dragonsScore: 2,
          opponentScore: 7,
          notes: '大敗',
        },
        expectedResult: GameResultValue.LOSE,
      },
      {
        description: 'should save a game with DRAW result',
        gameData: {
          date: new Date('2024-04-03'),
          opponent: '広島東洋カープ',
          stadium: 'マツダスタジアム',
          dragonsScore: 4,
          opponentScore: 4,
          notes: '引き分け',
        },
        expectedResult: GameResultValue.DRAW,
      },
    ];

    test.each(testCases)(
      '$description',
      async ({ gameData, expectedResult }) => {
        try {
          await prismaClient.$transaction(
            async (tx) => {
              const gameId = new GameId(randomUUID());
              const game = new Game(
                gameId,
                new GameDate(gameData.date),
                new Opponent(gameData.opponent),
                new Score(gameData.dragonsScore),
                new Score(gameData.opponentScore),
                new Stadium(gameData.stadium),
                new Notes(gameData.notes),
                gameData.date,
                gameData.date,
              );

              const adapter = new GameAdapter(tx as PrismaClient);
              const result = await adapter.save(game);

              expect(result).toBeInstanceOf(Game);
              expect(result.id.value).toBe(gameId.value);
              expect(result.gameDate.value).toEqual(gameData.date);
              expect(result.opponent.value).toBe(gameData.opponent);
              expect(result.stadium.value).toBe(gameData.stadium);
              expect(result.dragonsScore.value).toBe(gameData.dragonsScore);
              expect(result.opponentScore.value).toBe(gameData.opponentScore);
              expect(result.result.value).toBe(expectedResult);

              if (gameData.notes) {
                expect(result.notes?.value).toBe(gameData.notes);
              } else {
                expect(result.notes).toBeUndefined();
              }

              const savedGame = await tx.game.findUnique({
                where: { id: gameId.value },
              });

              expect(savedGame).not.toBeNull();
              expect(savedGame?.id).toBe(gameId.value);
              expect(savedGame?.gameDate).toEqual(gameData.date);
              expect(savedGame?.opponent).toBe(gameData.opponent);
              expect(savedGame?.stadium).toBe(gameData.stadium);
              expect(savedGame?.dragonsScore).toBe(gameData.dragonsScore);
              expect(savedGame?.opponentScore).toBe(gameData.opponentScore);
              expect(savedGame?.result).toBe(expectedResult);
              expect(savedGame?.notes).toBe(gameData.notes || null);

              throw new Error('Rollback transaction');
            },
            {
              maxWait: 5000,
              timeout: 10000,
            },
          );
        } catch (error: unknown) {
          expect((error as Error).message).toBe('Rollback transaction');
        }
      },
    );
  });

  describe('findAll', () => {
    const testGames = [
      {
        description: 'first game - WIN',
        gameData: {
          date: new Date('2024-04-01'),
          opponent: '横浜DeNAベイスターズ',
          stadium: 'バンテリンドーム',
          dragonsScore: 5,
          opponentScore: 3,
          notes: '開幕戦で勝利！',
        },
        expectedResult: GameResultValue.WIN,
      },
      {
        description: 'second game - LOSE',
        gameData: {
          date: new Date('2024-04-03'),
          opponent: '阪神タイガース',
          stadium: '甲子園',
          dragonsScore: 2,
          opponentScore: 7,
          notes: '大敗',
        },
        expectedResult: GameResultValue.LOSE,
      },
    ];

    it('should return all games ordered by gameDate desc', async () => {
      await prismaService.game.deleteMany();

      const savedGameIds: string[] = [];

      for (const { gameData, expectedResult } of testGames) {
        const gameId = randomUUID();
        await prismaService.game.create({
          data: {
            id: gameId,
            gameDate: gameData.date,
            opponent: gameData.opponent,
            stadium: gameData.stadium,
            dragonsScore: gameData.dragonsScore,
            opponentScore: gameData.opponentScore,
            result: expectedResult,
            notes: gameData.notes,
          },
        });
        savedGameIds.push(gameId);
      }

      const adapter = new GameAdapter(prismaClient);
      const result = await adapter.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Game);

      expect(result[0].gameDate.value).toEqual(new Date('2024-04-03'));
      expect(result[0].opponent.value).toBe('阪神タイガース');
      expect(result[0].stadium.value).toBe('甲子園');
      expect(result[0].dragonsScore.value).toBe(2);
      expect(result[0].opponentScore.value).toBe(7);
      expect(result[0].result.value).toBe(GameResultValue.LOSE);
      expect(result[0].notes?.value).toBe('大敗');

      expect(result[1].gameDate.value).toEqual(new Date('2024-04-01'));
      expect(result[1].opponent.value).toBe('横浜DeNAベイスターズ');
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
          stadium: 'バンテリンドーム',
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
          stadium: '甲子園',
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
          stadium: 'バンテリンドーム',
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultValue.WIN,
          notes: 'テスト試合',
        },
      });
    });

    describe('findById', () => {
      it('should return a game when it exists', async () => {
        const result = await adapter.findById(testGameIdVO);

        expect(result).not.toBeNull();
        expect(result?.id.value).toBe(testGameId);
        expect(result?.opponent.value).toBe('横浜DeNAベイスターズ');
        expect(result?.dragonsScore.value).toBe(5);
        expect(result?.result.value).toBe(GameResultValue.WIN);
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

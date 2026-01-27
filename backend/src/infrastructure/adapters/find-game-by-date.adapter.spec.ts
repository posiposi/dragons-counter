import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { FindGameByDateAdapter } from './find-game-by-date.adapter';
import { GameDate } from '../../domain/value-objects/game-date';
import { GameResultValue } from '../../domain/value-objects/game-result';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('FindGameByDateAdapter Integration Tests', () => {
  let prismaService: PrismaService;
  let module: TestingModule;
  let adapter: FindGameByDateAdapter;

  // 固定のスタジアムID（find-game-by-date専用）
  const testStadiums = {
    vantelin: {
      id: '22222222-find-0001-0001-000000000001',
      name: 'バンテリンドーム_findbydate',
    },
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        FindGameByDateAdapter,
        PrismaService,
        {
          provide: PrismaClient,
          useExisting: PrismaService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    adapter = module.get<FindGameByDateAdapter>(FindGameByDateAdapter);

    // スタジアムをupsertで作成（並列実行でもCIエラーにならないように）
    for (const stadium of Object.values(testStadiums)) {
      await prismaService.stadium.upsert({
        where: { id: stadium.id },
        update: { name: stadium.name },
        create: {
          id: stadium.id,
          name: stadium.name,
        },
      });
    }
  });

  afterEach(async () => {
    const stadiumIds = Object.values(testStadiums).map((s) => s.id);
    await prismaService.game.deleteMany({
      where: { stadiumId: { in: stadiumIds } },
    });
  });

  afterAll(async () => {
    const stadiumIds = Object.values(testStadiums).map((s) => s.id);
    await prismaService.game.deleteMany({
      where: { stadiumId: { in: stadiumIds } },
    });
    await prismaService.stadium.deleteMany({
      where: { id: { in: stadiumIds } },
    });
    await prismaService.$disconnect();
    await module.close();
  });

  describe('findByDate', () => {
    it('should return a game when matching date exists', async () => {
      const testGameId = randomUUID();
      const testDate = new Date('2024-07-01');

      await prismaService.game.create({
        data: {
          id: testGameId,
          gameDate: testDate,
          opponent: '阪神タイガース',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultValue.WIN,
        },
      });

      const result = await adapter.findByDate(new GameDate(testDate));

      expect(result).not.toBeNull();
      expect(result?.id.value).toBe(testGameId);
      expect(result?.opponent.value).toBe('阪神タイガース');
    });

    it('should return null when no matching game exists', async () => {
      const result = await adapter.findByDate(
        new GameDate(new Date('2024-07-01')),
      );

      expect(result).toBeNull();
    });

    it('should return null when date does not match', async () => {
      await prismaService.game.create({
        data: {
          id: randomUUID(),
          gameDate: new Date('2024-07-01'),
          opponent: '阪神タイガース',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultValue.WIN,
        },
      });

      const result = await adapter.findByDate(
        new GameDate(new Date('2024-07-02')),
      );

      expect(result).toBeNull();
    });

    it('should exclude soft-deleted games', async () => {
      const testDate = new Date('2024-07-01');

      await prismaService.game.create({
        data: {
          id: randomUUID(),
          gameDate: testDate,
          opponent: '阪神タイガース',
          stadiumId: testStadiums.vantelin.id,
          dragonsScore: 5,
          opponentScore: 3,
          result: GameResultValue.WIN,
          deletedAt: new Date(),
        },
      });

      const result = await adapter.findByDate(new GameDate(testDate));

      expect(result).toBeNull();
    });
  });
});

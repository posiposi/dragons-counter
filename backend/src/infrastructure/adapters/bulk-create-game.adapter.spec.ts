import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { BulkCreateGameAdapter } from './bulk-create-game.adapter';
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

describe('BulkCreateGameAdapter Integration Tests', () => {
  let prismaService: PrismaService;
  let module: TestingModule;
  let adapter: BulkCreateGameAdapter;

  const testStadiums = {
    vantelin: { id: randomUUID(), name: 'バンテリンドーム' },
    koshien: { id: randomUUID(), name: '甲子園' },
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        BulkCreateGameAdapter,
        PrismaService,
        {
          provide: PrismaClient,
          useExisting: PrismaService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    adapter = module.get<BulkCreateGameAdapter>(BulkCreateGameAdapter);

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

  afterEach(async () => {
    await prismaService.game.deleteMany();
  });

  afterAll(async () => {
    await prismaService.stadium.deleteMany();
    await prismaService.$disconnect();
    await module.close();
  });

  describe('save', () => {
    it('should save a game successfully', async () => {
      const gameId = new GameId(randomUUID());
      const stadium = Stadium.create(
        StadiumId.create(testStadiums.vantelin.id),
        StadiumName.create(testStadiums.vantelin.name),
      );
      const game = new Game(
        gameId,
        new GameDate(new Date('2024-04-01')),
        new Opponent('阪神タイガース'),
        new Score(5),
        new Score(3),
        stadium,
        undefined,
        new Date('2024-04-01'),
        new Date('2024-04-01'),
      );

      await adapter.save(game);

      const savedGame = await prismaService.game.findUnique({
        where: { id: gameId.value },
      });

      expect(savedGame).not.toBeNull();
      expect(savedGame?.opponent).toBe('阪神タイガース');
      expect(savedGame?.dragonsScore).toBe(5);
      expect(savedGame?.opponentScore).toBe(3);
      expect(savedGame?.stadiumId).toBe(testStadiums.vantelin.id);
      expect(savedGame?.result).toBe(GameResultValue.WIN);
    });

    it('should save a game with notes', async () => {
      const gameId = new GameId(randomUUID());
      const stadium = Stadium.create(
        StadiumId.create(testStadiums.vantelin.id),
        StadiumName.create(testStadiums.vantelin.name),
      );
      const game = new Game(
        gameId,
        new GameDate(new Date('2024-04-01')),
        new Opponent('阪神タイガース'),
        new Score(5),
        new Score(3),
        stadium,
        new Notes('開幕戦勝利！'),
        new Date('2024-04-01'),
        new Date('2024-04-01'),
      );

      await adapter.save(game);

      const savedGame = await prismaService.game.findUnique({
        where: { id: gameId.value },
      });

      expect(savedGame?.notes).toBe('開幕戦勝利！');
    });
  });
});

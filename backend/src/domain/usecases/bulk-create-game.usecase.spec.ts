import { Test, TestingModule } from '@nestjs/testing';
import { BulkCreateGameUsecase } from './bulk-create-game.usecase';
import { BulkCreateGamePort } from '../ports/bulk-create-game.port';
import { FindGameByDatePort } from '../ports/find-game-by-date.port';
import { Game } from '../entities/game';
import { GameId } from '../value-objects/game-id';
import { GameDate } from '../value-objects/game-date';
import { Opponent } from '../value-objects/opponent';
import { Score } from '../value-objects/score';
import { Stadium } from '../value-objects/stadium';
import { StadiumId } from '../value-objects/stadium-id';
import { StadiumName } from '../value-objects/stadium-name';
import { GameInputDto } from '../../application/dto/request/bulk-create-game.dto';

describe('BulkCreateGameUsecase', () => {
  let usecase: BulkCreateGameUsecase;
  let bulkCreateGamePort: BulkCreateGamePort;
  let findGameByDatePort: FindGameByDatePort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkCreateGameUsecase,
        {
          provide: 'BulkCreateGamePort',
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: 'FindGameByDatePort',
          useValue: {
            findByDate: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<BulkCreateGameUsecase>(BulkCreateGameUsecase);
    bulkCreateGamePort = module.get<BulkCreateGamePort>('BulkCreateGamePort');
    findGameByDatePort = module.get<FindGameByDatePort>('FindGameByDatePort');
  });

  describe('execute', () => {
    it('should save a new game when no duplicate exists', async () => {
      const inputs: GameInputDto[] = [
        {
          gameDate: '2024-04-01',
          opponent: '阪神タイガース',
          dragonsScore: 5,
          opponentScore: 3,
          stadium: 'バンテリンドーム ナゴヤ',
        },
      ];

      jest.spyOn(findGameByDatePort, 'findByDate').mockResolvedValue(null);
      const saveSpy = jest
        .spyOn(bulkCreateGamePort, 'save')
        .mockResolvedValue(undefined);

      const result = await usecase.execute(inputs);

      expect(result.savedCount).toBe(1);
      expect(result.skippedCount).toBe(0);
      expect(result.errors).toEqual([]);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('should skip when duplicate game exists', async () => {
      const inputs: GameInputDto[] = [
        {
          gameDate: '2024-04-01',
          opponent: '阪神タイガース',
          dragonsScore: 5,
          opponentScore: 3,
          stadium: 'バンテリンドーム ナゴヤ',
        },
      ];

      const existingGame = new Game(
        new GameId('existing-game-id'),
        new GameDate(new Date('2024-04-01')),
        new Opponent('阪神タイガース'),
        new Score(5),
        new Score(3),
        Stadium.create(
          StadiumId.create('stadium-id-1'),
          StadiumName.create('バンテリンドーム ナゴヤ'),
        ),
        undefined,
        new Date(),
        new Date(),
      );

      jest
        .spyOn(findGameByDatePort, 'findByDate')
        .mockResolvedValue(existingGame);
      const saveSpy = jest.spyOn(bulkCreateGamePort, 'save');

      const result = await usecase.execute(inputs);

      expect(result.savedCount).toBe(0);
      expect(result.skippedCount).toBe(1);
      expect(result.errors).toEqual([]);
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple games with mixed results', async () => {
      const inputs: GameInputDto[] = [
        {
          gameDate: '2024-04-01',
          opponent: '阪神タイガース',
          dragonsScore: 5,
          opponentScore: 3,
          stadium: 'バンテリンドーム ナゴヤ',
        },
        {
          gameDate: '2024-04-02',
          opponent: '広島東洋カープ',
          dragonsScore: 2,
          opponentScore: 1,
          stadium: 'バンテリンドーム ナゴヤ',
        },
      ];

      const existingGame = new Game(
        new GameId('existing-game-id'),
        new GameDate(new Date('2024-04-01')),
        new Opponent('阪神タイガース'),
        new Score(5),
        new Score(3),
        Stadium.create(
          StadiumId.create('stadium-id-1'),
          StadiumName.create('バンテリンドーム ナゴヤ'),
        ),
        undefined,
        new Date(),
        new Date(),
      );

      jest
        .spyOn(findGameByDatePort, 'findByDate')
        .mockResolvedValueOnce(existingGame)
        .mockResolvedValueOnce(null);
      const saveSpy = jest
        .spyOn(bulkCreateGamePort, 'save')
        .mockResolvedValue(undefined);

      const result = await usecase.execute(inputs);

      expect(result.savedCount).toBe(1);
      expect(result.skippedCount).toBe(1);
      expect(result.errors).toEqual([]);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('should return empty result when no inputs provided', async () => {
      const inputs: GameInputDto[] = [];

      const result = await usecase.execute(inputs);

      expect(result.savedCount).toBe(0);
      expect(result.skippedCount).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should capture error when save fails', async () => {
      const inputs: GameInputDto[] = [
        {
          gameDate: '2024-04-01',
          opponent: '阪神タイガース',
          dragonsScore: 5,
          opponentScore: 3,
          stadium: 'バンテリンドーム ナゴヤ',
        },
      ];

      jest.spyOn(findGameByDatePort, 'findByDate').mockResolvedValue(null);
      jest
        .spyOn(bulkCreateGamePort, 'save')
        .mockRejectedValue(new Error('Database error'));

      const result = await usecase.execute(inputs);

      expect(result.savedCount).toBe(0);
      expect(result.skippedCount).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('2024-04-01');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { GetGamesController } from './get-games.controller';
import { GetGamesUsecase } from '../../domain/usecases/get-games.usecase';
import { GameResponseDto } from '../dto/response/game-response.dto';

describe('GetGamesController', () => {
  let controller: GetGamesController;
  let usecase: GetGamesUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetGamesController],
      providers: [
        {
          provide: GetGamesUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GetGamesController>(GetGamesController);
    usecase = module.get<GetGamesUsecase>(GetGamesUsecase);
  });

  describe('getGames', () => {
    it('should return all games', async () => {
      const mockGamesDto: GameResponseDto[] = [
        {
          id: 'game-1',
          gameDate: '2024-06-01',
          opponent: '巨人',
          dragonsScore: 5,
          opponentScore: 3,
          result: 'win',
          stadium: 'バンテリンドーム',
          notes: '逆転勝利！',
          createdAt: '2024-06-01T10:00:00.000Z',
          updatedAt: '2024-06-01T10:00:00.000Z',
        },
        {
          id: 'game-2',
          gameDate: '2024-06-02',
          opponent: '阪神',
          dragonsScore: 2,
          opponentScore: 4,
          result: 'lose',
          stadium: '甲子園',
          notes: '接戦でした',
          createdAt: '2024-06-02T10:00:00.000Z',
          updatedAt: '2024-06-02T10:00:00.000Z',
        },
      ];

      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(mockGamesDto);

      const result = await controller.getGames();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockGamesDto[0]);
      expect(result[1]).toEqual(mockGamesDto[1]);
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no games exist', async () => {
      const executeSpy = jest.spyOn(usecase, 'execute').mockResolvedValue([]);

      const result = await controller.getGames();

      expect(result).toEqual([]);
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle null notes correctly', async () => {
      const mockGamesDto: GameResponseDto[] = [
        {
          id: 'game-1',
          gameDate: '2024-06-01',
          opponent: '巨人',
          dragonsScore: 5,
          opponentScore: 3,
          result: 'win',
          stadium: 'バンテリンドーム',
          notes: null,
          createdAt: '2024-06-01T10:00:00.000Z',
          updatedAt: '2024-06-01T10:00:00.000Z',
        },
      ];

      jest.spyOn(usecase, 'execute').mockResolvedValue(mockGamesDto);

      const result = await controller.getGames();

      expect(result[0]?.notes).toBeNull();
    });
  });
});

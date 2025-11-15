import { Test, TestingModule } from '@nestjs/testing';
import { GetGamesUsecase } from './get-games.usecase';
import { GamePort } from '../ports/game.port';
import { Game } from '../entities/game';
import { GameId } from '../value-objects/game-id';
import { GameDate } from '../value-objects/game-date';
import { Opponent } from '../value-objects/opponent';
import { Score } from '../value-objects/score';
import { Stadium } from '../value-objects/stadium';
import { Notes } from '../value-objects/notes';
import { GameResponseDto } from '../../application/dto/response/game-response.dto';

describe('GetGamesUsecase', () => {
  let usecase: GetGamesUsecase;
  let gamePort: GamePort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetGamesUsecase,
        {
          provide: 'GamePort',
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<GetGamesUsecase>(GetGamesUsecase);
    gamePort = module.get<GamePort>('GamePort');
  });

  describe('execute', () => {
    it('should return all games from the repository', async () => {
      const mockGames: Game[] = [
        new Game(
          new GameId('game-1'),
          new GameDate(new Date('2024-06-01')),
          new Opponent('巨人'),
          new Score(5),
          new Score(3),
          new Stadium('バンテリンドーム'),
          new Notes('逆転勝利！'),
          new Date('2024-06-01T10:00:00Z'),
          new Date('2024-06-01T10:00:00Z'),
        ),
        new Game(
          new GameId('game-2'),
          new GameDate(new Date('2024-06-02')),
          new Opponent('阪神'),
          new Score(2),
          new Score(4),
          new Stadium('甲子園'),
          new Notes('接戦でした'),
          new Date('2024-06-02T10:00:00Z'),
          new Date('2024-06-02T10:00:00Z'),
        ),
      ];

      const findAllSpy = jest
        .spyOn(gamePort, 'findAll')
        .mockResolvedValue(mockGames);

      const result = await usecase.execute();

      const expectedDto: GameResponseDto[] = [
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

      expect(result).toEqual(expectedDto);
      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(findAllSpy).toHaveBeenCalledWith();
    });

    it('should return empty array when no games exist', async () => {
      const findAllSpy = jest.spyOn(gamePort, 'findAll').mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toEqual([]);
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      const findAllSpy = jest
        .spyOn(gamePort, 'findAll')
        .mockRejectedValue(error);

      await expect(usecase.execute()).rejects.toThrow('Database error');
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });
  });
});

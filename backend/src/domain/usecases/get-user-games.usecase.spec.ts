import { Test, TestingModule } from '@nestjs/testing';
import { GetUserGamesUsecase } from './get-user-games.usecase';
import { UserGameQueryPort } from '../ports/user-game-query.port';
import { GamePort } from '../ports/game.port';
import { UserGame } from '../entities/user-game';
import { Game } from '../entities/game';
import { UserGameId } from '../value-objects/user-game-id';
import { UserId } from '../value-objects/user-id';
import { GameId } from '../value-objects/game-id';
import { GameDate } from '../value-objects/game-date';
import { Opponent } from '../value-objects/opponent';
import { Score } from '../value-objects/score';
import { Stadium } from '../value-objects/stadium';
import { StadiumId } from '../value-objects/stadium-id';
import { StadiumName } from '../value-objects/stadium-name';
import { Impression } from '../value-objects/impression';
import { UserGameWithGameReadModel } from './read-models/user-game-with-game.read-model';
import { GameNotFoundException } from '../exceptions/game-not-found.exception';

describe('GetUserGamesUsecase', () => {
  let usecase: GetUserGamesUsecase;
  let userGameQueryPort: UserGameQueryPort;
  let gamePort: GamePort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserGamesUsecase,
        {
          provide: 'UserGameQueryPort',
          useValue: {
            findByUserId: jest.fn(),
          },
        },
        {
          provide: 'GamePort',
          useValue: {
            findByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<GetUserGamesUsecase>(GetUserGamesUsecase);
    userGameQueryPort = module.get<UserGameQueryPort>('UserGameQueryPort');
    gamePort = module.get<GamePort>('GamePort');
  });

  describe('execute', () => {
    it('観戦試合一覧が正しいDTOとして返却される', async () => {
      const userId = 'user-1';
      const createdAt = new Date('2024-06-01T12:00:00Z');
      const updatedAt = new Date('2024-06-01T12:00:00Z');

      const mockUserGames: UserGame[] = [
        UserGame.fromRepository(
          UserGameId.create('ug-1'),
          UserId.create(userId),
          new GameId('game-1'),
          Impression.create('楽しかった'),
          createdAt,
          updatedAt,
        ),
        UserGame.fromRepository(
          UserGameId.create('ug-2'),
          UserId.create(userId),
          new GameId('game-2'),
          null,
          createdAt,
          updatedAt,
        ),
      ];

      const mockGame1 = new Game(
        new GameId('game-1'),
        new GameDate(new Date('2024-06-01')),
        new Opponent('巨人'),
        new Score(5),
        new Score(3),
        Stadium.create(
          StadiumId.create('stadium-1'),
          StadiumName.create('バンテリンドーム'),
        ),
        new Date('2024-06-01T10:00:00Z'),
        new Date('2024-06-01T10:00:00Z'),
      );

      const mockGame2 = new Game(
        new GameId('game-2'),
        new GameDate(new Date('2024-06-02')),
        new Opponent('阪神'),
        new Score(2),
        new Score(4),
        Stadium.create(
          StadiumId.create('stadium-2'),
          StadiumName.create('甲子園'),
        ),
        new Date('2024-06-02T10:00:00Z'),
        new Date('2024-06-02T10:00:00Z'),
      );

      jest
        .spyOn(userGameQueryPort, 'findByUserId')
        .mockResolvedValue(mockUserGames);
      jest
        .spyOn(gamePort, 'findByIds')
        .mockResolvedValue([mockGame1, mockGame2]);

      const result = await usecase.execute(userId);

      const expected: UserGameWithGameReadModel[] = [
        {
          id: 'ug-1',
          gameId: 'game-1',
          gameDate: '2024-06-01',
          opponent: '巨人',
          dragonsScore: 5,
          opponentScore: 3,
          result: 'win',
          stadium: 'バンテリンドーム',
          impression: '楽しかった',
          createdAt: '2024-06-01T12:00:00.000Z',
        },
        {
          id: 'ug-2',
          gameId: 'game-2',
          gameDate: '2024-06-02',
          opponent: '阪神',
          dragonsScore: 2,
          opponentScore: 4,
          result: 'lose',
          stadium: '甲子園',
          impression: null,
          createdAt: '2024-06-01T12:00:00.000Z',
        },
      ];

      expect(result).toEqual(expected);
    });

    it('観戦試合がない場合、空配列が返却される', async () => {
      const findByUserIdSpy = jest
        .spyOn(userGameQueryPort, 'findByUserId')
        .mockResolvedValue([]);
      const findByIdsSpy = jest.spyOn(gamePort, 'findByIds');

      const result = await usecase.execute('user-1');

      expect(result).toEqual([]);
      expect(findByUserIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdsSpy).not.toHaveBeenCalled();
    });

    it('関連試合が欠落している場合にGameNotFoundExceptionがスローされる', async () => {
      const userId = 'user-1';
      const createdAt = new Date('2024-06-01T12:00:00Z');
      const updatedAt = new Date('2024-06-01T12:00:00Z');

      const mockUserGames: UserGame[] = [
        UserGame.fromRepository(
          UserGameId.create('ug-1'),
          UserId.create(userId),
          new GameId('game-1'),
          Impression.create('楽しかった'),
          createdAt,
          updatedAt,
        ),
        UserGame.fromRepository(
          UserGameId.create('ug-2'),
          UserId.create(userId),
          new GameId('game-deleted'),
          null,
          createdAt,
          updatedAt,
        ),
      ];

      const mockGame1 = new Game(
        new GameId('game-1'),
        new GameDate(new Date('2024-06-01')),
        new Opponent('巨人'),
        new Score(5),
        new Score(3),
        Stadium.create(
          StadiumId.create('stadium-1'),
          StadiumName.create('バンテリンドーム'),
        ),
        new Date('2024-06-01T10:00:00Z'),
        new Date('2024-06-01T10:00:00Z'),
      );

      jest
        .spyOn(userGameQueryPort, 'findByUserId')
        .mockResolvedValue(mockUserGames);
      jest.spyOn(gamePort, 'findByIds').mockResolvedValue([mockGame1]);

      await expect(usecase.execute(userId)).rejects.toThrow(
        GameNotFoundException,
      );
    });
  });
});

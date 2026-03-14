import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RegisterUserGameUsecase } from './register-user-game.usecase';
import { UserGameAlreadyExistsException } from '../exceptions/user-game-already-exists.exception';
import { UserGame } from '../entities/user-game';
import { Game } from '../entities/game';

describe('RegisterUserGameUsecase', () => {
  let usecase: RegisterUserGameUsecase;
  let mockUserGameCommandPort: {
    save: jest.Mock<Promise<UserGame>, [UserGame]>;
  };
  let mockUserGameQueryPort: {
    findByUserIdAndGameId: jest.Mock;
  };
  let mockGamePort: { findById: jest.Mock };

  beforeEach(async () => {
    mockUserGameCommandPort = {
      save: jest.fn<Promise<UserGame>, [UserGame]>(),
    };
    mockUserGameQueryPort = {
      findByUserIdAndGameId: jest.fn(),
    };
    mockGamePort = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserGameUsecase,
        {
          provide: 'UserGameCommandPort',
          useValue: mockUserGameCommandPort,
        },
        {
          provide: 'UserGameQueryPort',
          useValue: mockUserGameQueryPort,
        },
        {
          provide: 'GamePort',
          useValue: mockGamePort,
        },
      ],
    }).compile();

    usecase = module.get<RegisterUserGameUsecase>(RegisterUserGameUsecase);
  });

  describe('execute', () => {
    const userId = 'user-123';
    const gameId = 'game-456';

    describe('正常系', () => {
      it('新規観戦登録が成功する', async () => {
        mockGamePort.findById.mockResolvedValue({} as Game);
        mockUserGameQueryPort.findByUserIdAndGameId.mockResolvedValue(null);
        mockUserGameCommandPort.save.mockResolvedValue(undefined);

        await usecase.execute(userId, gameId);

        expect(mockGamePort.findById).toHaveBeenCalledTimes(1);
        expect(
          mockUserGameQueryPort.findByUserIdAndGameId,
        ).toHaveBeenCalledTimes(1);
        expect(mockUserGameCommandPort.save).toHaveBeenCalledTimes(1);
      });

      it('saveに渡されるUserGameのuserId・gameIdが正しい', async () => {
        mockGamePort.findById.mockResolvedValue({} as Game);
        mockUserGameQueryPort.findByUserIdAndGameId.mockResolvedValue(null);
        mockUserGameCommandPort.save.mockResolvedValue(undefined);

        await usecase.execute(userId, gameId);

        const savedUserGame = mockUserGameCommandPort.save.mock.calls[0][0];
        expect(savedUserGame).toBeInstanceOf(UserGame);
        expect(savedUserGame.userId.value).toBe(userId);
        expect(savedUserGame.gameId.value).toBe(gameId);
      });
    });

    describe('異常系', () => {
      it('存在しない試合IDの場合NotFoundExceptionがスローされる', async () => {
        mockGamePort.findById.mockResolvedValue(null);

        await expect(usecase.execute(userId, gameId)).rejects.toThrow(
          NotFoundException,
        );

        expect(mockUserGameCommandPort.save).not.toHaveBeenCalled();
      });

      it('重複登録の場合UserGameAlreadyExistsExceptionがスローされる', async () => {
        mockGamePort.findById.mockResolvedValue({} as Game);
        mockUserGameQueryPort.findByUserIdAndGameId.mockResolvedValue(
          {} as UserGame,
        );

        await expect(usecase.execute(userId, gameId)).rejects.toThrow(
          UserGameAlreadyExistsException,
        );

        expect(mockUserGameCommandPort.save).not.toHaveBeenCalled();
      });
    });
  });
});

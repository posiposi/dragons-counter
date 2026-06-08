import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserGameUsecase } from './delete-user-game.usecase';
import { UserGame } from '../entities/user-game';
import { UserId } from '../value-objects/user-id';
import { GameId } from '../value-objects/game-id';

describe('DeleteUserGameUsecase', () => {
  let usecase: DeleteUserGameUsecase;
  let mockUserGameCommandPort: {
    softDelete: jest.Mock<Promise<void>, [UserId, GameId]>;
  };
  let mockUserGameQueryPort: {
    findByUserIdAndGameId: jest.Mock;
  };

  beforeEach(async () => {
    mockUserGameCommandPort = {
      softDelete: jest.fn<Promise<void>, [UserId, GameId]>(),
    };
    mockUserGameQueryPort = {
      findByUserIdAndGameId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserGameUsecase,
        {
          provide: 'UserGameCommandPort',
          useValue: mockUserGameCommandPort,
        },
        {
          provide: 'UserGameQueryPort',
          useValue: mockUserGameQueryPort,
        },
      ],
    }).compile();

    usecase = module.get<DeleteUserGameUsecase>(DeleteUserGameUsecase);
  });

  describe('execute', () => {
    const userId = 'user-123';
    const gameId = 'game-456';

    describe('正常系', () => {
      it('対象レコードが存在する場合softDeleteが呼ばれる', async () => {
        mockUserGameQueryPort.findByUserIdAndGameId.mockResolvedValue(
          {} as UserGame,
        );
        mockUserGameCommandPort.softDelete.mockResolvedValue(undefined);

        await usecase.execute(userId, gameId);

        expect(
          mockUserGameQueryPort.findByUserIdAndGameId,
        ).toHaveBeenCalledWith(expect.any(UserId), expect.any(GameId));
        expect(mockUserGameCommandPort.softDelete).toHaveBeenCalledWith(
          expect.any(UserId),
          expect.any(GameId),
        );
      });

      it('softDeleteに渡されるuserId・gameIdが正しい', async () => {
        mockUserGameQueryPort.findByUserIdAndGameId.mockResolvedValue(
          {} as UserGame,
        );
        mockUserGameCommandPort.softDelete.mockResolvedValue(undefined);

        await usecase.execute(userId, gameId);

        const [passedUserId, passedGameId] =
          mockUserGameCommandPort.softDelete.mock.calls[0];
        expect(passedUserId.value).toBe(userId);
        expect(passedGameId.value).toBe(gameId);
      });
    });

    describe('異常系', () => {
      it('対象レコードが存在しない場合NotFoundExceptionがスローされる', async () => {
        mockUserGameQueryPort.findByUserIdAndGameId.mockResolvedValue(null);

        await expect(usecase.execute(userId, gameId)).rejects.toThrow(
          NotFoundException,
        );

        expect(mockUserGameCommandPort.softDelete).not.toHaveBeenCalled();
      });

      it('他ユーザーの観戦記録は削除できずNotFoundExceptionがスローされる', async () => {
        mockUserGameQueryPort.findByUserIdAndGameId.mockResolvedValue(null);

        await expect(usecase.execute(userId, gameId)).rejects.toThrow(
          NotFoundException,
        );

        expect(mockUserGameCommandPort.softDelete).not.toHaveBeenCalled();
      });
    });
  });
});

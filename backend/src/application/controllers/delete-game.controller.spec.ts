import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { DeleteGameController } from './delete-game.controller';
import { DeleteGameUsecase } from '../../domain/usecases/delete-game.usecase';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

describe('DeleteGameController', () => {
  let controller: DeleteGameController;
  let usecase: DeleteGameUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteGameController],
      providers: [
        {
          provide: DeleteGameUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DeleteGameController>(DeleteGameController);
    usecase = module.get<DeleteGameUsecase>(DeleteGameUsecase);
  });

  describe('deleteGame', () => {
    const gameId = 'valid-uuid-game-id';

    it('should delete game successfully', async () => {
      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(undefined);

      await controller.deleteGame(gameId);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(gameId);
    });

    it('should throw NotFoundException when game not found', async () => {
      jest
        .spyOn(usecase, 'execute')
        .mockRejectedValue(new NotFoundException('Game not found'));

      await expect(controller.deleteGame(gameId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException when deletion fails', async () => {
      jest
        .spyOn(usecase, 'execute')
        .mockRejectedValue(
          new InternalServerErrorException('Failed to delete game'),
        );

      await expect(controller.deleteGame(gameId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  it('JwtAuthGuardとAdminGuardがクラスレベルで適用されている', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      DeleteGameController,
    ) as Array<new (...args: unknown[]) => unknown>;

    expect(guards).toBeDefined();
    expect(guards).toHaveLength(2);
    expect(guards[0]).toBe(JwtAuthGuard);
    expect(guards[1]).toBe(AdminGuard);
  });
});

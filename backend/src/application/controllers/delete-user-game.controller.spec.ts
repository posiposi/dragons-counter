import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA, HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { DeleteUserGameController } from './delete-user-game.controller';
import { DeleteUserGameUsecase } from '../../domain/usecases/delete-user-game.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('DeleteUserGameController', () => {
  let controller: DeleteUserGameController;
  let usecase: DeleteUserGameUsecase;

  const deleteUserGameMethod = Object.getOwnPropertyDescriptor(
    DeleteUserGameController.prototype,
    'deleteUserGame',
  )!.value as (...args: unknown[]) => unknown;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteUserGameController],
      providers: [
        {
          provide: DeleteUserGameUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DeleteUserGameController>(DeleteUserGameController);
    usecase = module.get<DeleteUserGameUsecase>(DeleteUserGameUsecase);
  });

  describe('deleteUserGame', () => {
    const req = { user: { userId: 'user-123', email: 'test@example.com' } };
    const gameId = 'game-456';

    it('usecaseのexecuteがuserIdとgameIdで呼ばれる', async () => {
      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(undefined);

      await controller.deleteUserGame(req, gameId);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith('user-123', 'game-456');
    });

    it('usecaseがrejectした場合に例外が握りつぶされず伝播する', async () => {
      jest
        .spyOn(usecase, 'execute')
        .mockRejectedValue(new NotFoundException('観戦記録が見つかりません'));

      await expect(controller.deleteUserGame(req, gameId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('JwtAuthGuardがクラスレベルで適用されている', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      DeleteUserGameController,
    ) as Array<new (...args: unknown[]) => unknown>;

    expect(guards).toBeDefined();
    expect(guards).toHaveLength(1);
    expect(guards[0]).toBe(JwtAuthGuard);
  });

  it('HTTPステータスコード204が設定されている', () => {
    const httpCode = Reflect.getMetadata(
      HTTP_CODE_METADATA,
      deleteUserGameMethod,
    ) as number;

    expect(httpCode).toBe(HttpStatus.NO_CONTENT);
  });
});

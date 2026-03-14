import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { RegisterUserGameController } from './register-user-game.controller';
import { RegisterUserGameUsecase } from '../../domain/usecases/register-user-game.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('RegisterUserGameController', () => {
  let controller: RegisterUserGameController;
  let usecase: RegisterUserGameUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegisterUserGameController],
      providers: [
        {
          provide: RegisterUserGameUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RegisterUserGameController>(
      RegisterUserGameController,
    );
    usecase = module.get<RegisterUserGameUsecase>(RegisterUserGameUsecase);
  });

  describe('register', () => {
    const req = { user: { userId: 'user-123', email: 'test@example.com' } };
    const dto = { gameId: 'game-456' };

    it('usecaseのexecuteがuserIdとgameIdで呼ばれる', async () => {
      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(undefined);

      await controller.register(req, dto);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith('user-123', 'game-456');
    });
  });

  it('JwtAuthGuardがクラスレベルで適用されている', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      RegisterUserGameController,
    ) as Array<new (...args: unknown[]) => unknown>;

    expect(guards).toBeDefined();
    expect(guards).toHaveLength(1);
    expect(guards[0]).toBe(JwtAuthGuard);
  });
});

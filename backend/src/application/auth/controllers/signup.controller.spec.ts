import { Test, TestingModule } from '@nestjs/testing';
import { SignupController } from './signup.controller';
import { SignupUsecase } from '../../../domain/usecases/signup.usecase';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';

describe('SignupController', () => {
  let controller: SignupController;
  let usecase: SignupUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignupController],
      providers: [
        {
          provide: SignupUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SignupController>(SignupController);
    usecase = module.get<SignupUsecase>(SignupUsecase);
  });

  describe('signup', () => {
    it('有効なリクエストでSignupUsecase.executeが呼ばれる', async () => {
      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(undefined);

      await controller.signup({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });

    it('SignupUsecaseがUserAlreadyExistsExceptionをスローした場合そのまま伝播する', async () => {
      jest
        .spyOn(usecase, 'execute')
        .mockRejectedValue(
          new UserAlreadyExistsException(
            'このメールアドレスは既に登録されています',
          ),
        );

      await expect(
        controller.signup({
          email: 'existing@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UserAlreadyExistsException);
    });

    it('SkipCsrfデコレータが適用されている', () => {
      const signupMethod = Object.getOwnPropertyDescriptor(
        SignupController.prototype,
        'signup',
      )!.value as (...args: unknown[]) => unknown;

      const skipCsrf = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        signupMethod,
      ) as boolean;

      expect(skipCsrf).toBe(true);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { GUARDS_METADATA, HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { SigninController } from './signin.controller';
import { SigninUsecase } from '../../../domain/usecases/signin.usecase';
import { LocalAuthGuard } from '../guards/local-auth.guard';

describe('SigninController', () => {
  let controller: SigninController;
  let usecase: SigninUsecase;

  const signinMethod = Object.getOwnPropertyDescriptor(
    SigninController.prototype,
    'signin',
  )!.value as (...args: unknown[]) => unknown;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SigninController],
      providers: [
        {
          provide: SigninUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SigninController>(SigninController);
    usecase = module.get<SigninUsecase>(SigninUsecase);
  });

  describe('signin', () => {
    it('SigninUsecase.executeにreq.userを渡してaccessTokenを返す', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockResult = { accessToken: 'test-jwt-token' };
      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(mockResult);

      const result = await controller.signin(
        { email: 'test@example.com', password: 'password123' },
        { user: mockUser as never },
      );

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ accessToken: 'test-jwt-token' });
    });

    it('LocalAuthGuardが適用されている', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        signinMethod,
      ) as Array<new (...args: unknown[]) => unknown>;

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(1);
      expect(guards[0]).toBe(LocalAuthGuard);
    });

    it('HTTPステータスコード200が設定されている', () => {
      const httpCode = Reflect.getMetadata(
        HTTP_CODE_METADATA,
        signinMethod,
      ) as number;

      expect(httpCode).toBe(HttpStatus.OK);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { GUARDS_METADATA, HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { SigninController } from './signin.controller';
import { SigninUsecase } from '../../../domain/usecases/signin.usecase';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';

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
    const mockUser = { id: 'user-id', email: 'test@example.com' };
    const mockResult = { accessToken: 'test-jwt-token' };

    const createMockResponse = () => ({
      cookie: jest.fn(),
    });

    it('SigninUsecase.executeにreq.userを渡して呼び出す', async () => {
      const mockRes = createMockResponse();
      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(mockResult);

      await controller.signin(
        { email: 'test@example.com', password: 'password123' },
        { user: mockUser as never },
        mockRes as never,
      );

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(mockUser);
    });

    it('accessTokenをHttpOnly Cookieとしてセットする', async () => {
      const mockRes = createMockResponse();
      jest.spyOn(usecase, 'execute').mockResolvedValue(mockResult);

      await controller.signin(
        { email: 'test@example.com', password: 'password123' },
        { user: mockUser as never },
        mockRes as never,
      );

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'accessToken',
        'test-jwt-token',
        {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/api',
        },
      );
    });

    it('csrf-tokenをJavaScriptから読み取り可能なCookieとしてセットする', async () => {
      const mockRes = createMockResponse();
      jest.spyOn(usecase, 'execute').mockResolvedValue(mockResult);

      await controller.signin(
        { email: 'test@example.com', password: 'password123' },
        { user: mockUser as never },
        mockRes as never,
      );

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'csrf-token',
        expect.any(String),
        {
          httpOnly: false,
          secure: true,
          sameSite: 'lax',
          path: '/',
        },
      );
    });

    it('csrf-tokenは空でないランダム文字列である', async () => {
      const mockRes = createMockResponse();
      jest.spyOn(usecase, 'execute').mockResolvedValue(mockResult);

      await controller.signin(
        { email: 'test@example.com', password: 'password123' },
        { user: mockUser as never },
        mockRes as never,
      );

      const calls = mockRes.cookie.mock.calls as [string, string, unknown][];
      const csrfTokenCall = calls.find((call) => call[0] === 'csrf-token');
      expect(csrfTokenCall).toBeDefined();
      const csrfToken = csrfTokenCall![1];
      expect(csrfToken.length).toBeGreaterThan(0);
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

    it('SkipCsrfデコレータが適用されている', () => {
      const skipCsrf = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        signinMethod,
      ) as boolean;

      expect(skipCsrf).toBe(true);
    });
  });
});

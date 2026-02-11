import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { GUARDS_METADATA, HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { SignoutController } from './signout.controller';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('SignoutController', () => {
  let controller: SignoutController;

  const signoutMethod = Object.getOwnPropertyDescriptor(
    SignoutController.prototype,
    'signout',
  )!.value as (...args: unknown[]) => unknown;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignoutController],
    }).compile();

    controller = module.get<SignoutController>(SignoutController);
  });

  describe('signout', () => {
    const createMockResponse = () => ({
      clearCookie: jest.fn(),
    });

    it('accessToken Cookieがクリアされる', () => {
      const mockRes = createMockResponse();

      controller.signout(mockRes as never);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/api',
      });
    });

    it('csrf-token Cookieがクリアされる', () => {
      const mockRes = createMockResponse();

      controller.signout(mockRes as never);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('csrf-token', {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        path: '/',
      });
    });

    it('JwtAuthGuardが適用されている', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        signoutMethod,
      ) as Array<new (...args: unknown[]) => unknown>;

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(1);
      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('HTTPステータスコード200が設定されている', () => {
      const httpCode = Reflect.getMetadata(
        HTTP_CODE_METADATA,
        signoutMethod,
      ) as number;

      expect(httpCode).toBe(HttpStatus.OK);
    });
  });
});

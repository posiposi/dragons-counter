import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const originalEnv = process.env.JWT_SECRET;
  const TEST_SECRET = 'test-secret-key';

  beforeEach(async () => {
    process.env.JWT_SECRET = TEST_SECRET;

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.JWT_SECRET = originalEnv;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  it('JwtStrategyのインスタンスが正しく生成される', () => {
    expect(strategy).toBeDefined();
  });

  it('JWT_SECRETが未設定の場合にエラーをスローする', () => {
    delete process.env.JWT_SECRET;

    expect(() => new JwtStrategy()).toThrow(
      'JWT_SECRET environment variable is not defined',
    );
  });

  it('validateメソッドがpayloadからuserIdとemailとroleを返す', async () => {
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      role: 'USER',
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'USER',
    });
  });

  describe('CookieからのJWT抽出', () => {
    let jwtFromRequest: (req: Request) => string | null;

    beforeEach(() => {
      jwtFromRequest = (
        strategy as unknown as {
          _jwtFromRequest: (req: Request) => string | null;
        }
      )._jwtFromRequest;
    });

    it('CookieのaccessTokenからJWTを抽出する', () => {
      const token = jwt.sign(
        { sub: 'user-456', email: 'cookie@example.com' },
        TEST_SECRET,
      );
      const mockRequest = {
        cookies: { accessToken: token },
      } as unknown as Request;

      const extracted = jwtFromRequest(mockRequest);

      expect(extracted).toBe(token);
    });

    it('Cookieが存在しない場合はnullを返す', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const extracted = jwtFromRequest(mockRequest);

      expect(extracted).toBeNull();
    });

    it('cookiesプロパティが存在しない場合はnullを返す', () => {
      const mockRequest = {} as unknown as Request;

      const extracted = jwtFromRequest(mockRequest);

      expect(extracted).toBeNull();
    });

    it('リクエストがnullの場合はnullを返す', () => {
      const extracted = jwtFromRequest(null as unknown as Request);

      expect(extracted).toBeNull();
    });

    it('AuthorizationヘッダーのBearerトークンからは抽出しない', () => {
      const token = jwt.sign(
        { sub: 'user-789', email: 'bearer@example.com' },
        TEST_SECRET,
      );
      const mockRequest = {
        cookies: {},
        headers: { authorization: `Bearer ${token}` },
      } as unknown as Request;

      const extracted = jwtFromRequest(mockRequest);

      expect(extracted).toBeNull();
    });
  });
});

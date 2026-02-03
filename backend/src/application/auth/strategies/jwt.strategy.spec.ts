import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const originalEnv = process.env.JWT_SECRET;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret-key';

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

  it('validateメソッドがpayloadからuserIdとemailを返す', async () => {
    const payload = { sub: 'user-123', email: 'test@example.com' };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-123',
      email: 'test@example.com',
    });
  });
});

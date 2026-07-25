import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtTokenServiceAdapter } from './jwt-token-service.adapter';

describe('JwtTokenServiceAdapter', () => {
  const TEST_SECRET = 'test-secret-key-for-unit-tests';
  let adapter: JwtTokenServiceAdapter;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: TEST_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [JwtTokenServiceAdapter],
    }).compile();

    adapter = module.get(JwtTokenServiceAdapter);
  });

  const payload = {
    sub: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    role: 'user',
  };

  describe('sign → verify 往復検証', () => {
    it('sign で生成したトークンを verify でデコードすると元の claims が得られる', () => {
      const token = adapter.sign(payload);
      const decoded = adapter.verify(token);

      expect(decoded).toEqual(
        expect.objectContaining({
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
        }),
      );
    });
  });

  describe('verify', () => {
    it('無効なトークンで例外をスローする', () => {
      expect(() => adapter.verify('invalid.token.here')).toThrow();
    });

    it('異なるシークレットで署名されたトークンで例外をスローする', () => {
      const otherJwtService = new JwtService({
        secret: 'different-secret',
        signOptions: { expiresIn: '1h' },
      });
      const token = otherJwtService.sign(payload);

      expect(() => adapter.verify(token)).toThrow();
    });
  });

  describe('sign', () => {
    it('claims に sub, email, role が含まれる', () => {
      const token = adapter.sign(payload);
      const decoded = adapter.verify(token);

      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });
});

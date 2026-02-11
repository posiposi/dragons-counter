import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CsrfValidationGuard } from './csrf-validation.guard';

describe('CsrfValidationGuard', () => {
  let guard: CsrfValidationGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsrfValidationGuard],
    }).compile();

    guard = module.get<CsrfValidationGuard>(CsrfValidationGuard);
  });

  const createMockExecutionContext = (
    method: string,
    cookies: Record<string, string> = {},
    headers: Record<string, string | undefined> = {},
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          cookies,
          headers,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('CsrfValidationGuardのインスタンスが正しく生成される', () => {
    expect(guard).toBeDefined();
  });

  describe('安全なHTTPメソッド', () => {
    it('GETリクエストはバリデーションをスキップする', () => {
      const context = createMockExecutionContext('GET');

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('HEADリクエストはバリデーションをスキップする', () => {
      const context = createMockExecutionContext('HEAD');

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('OPTIONSリクエストはバリデーションをスキップする', () => {
      const context = createMockExecutionContext('OPTIONS');

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('POSTリクエスト', () => {
    it('CSRFトークンが一致すれば通過する', () => {
      const token = 'valid-csrf-token';
      const context = createMockExecutionContext(
        'POST',
        { 'csrf-token': token },
        { 'x-csrf-token': token },
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('CSRFトークンが不一致ならForbiddenExceptionをスローする', () => {
      const context = createMockExecutionContext(
        'POST',
        { 'csrf-token': 'cookie-token' },
        { 'x-csrf-token': 'different-header-token' },
      );

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('CSRFトークンヘッダーが未設定ならForbiddenExceptionをスローする', () => {
      const context = createMockExecutionContext(
        'POST',
        { 'csrf-token': 'cookie-token' },
        {},
      );

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('CSRFトークンCookieが未設定ならForbiddenExceptionをスローする', () => {
      const context = createMockExecutionContext(
        'POST',
        {},
        { 'x-csrf-token': 'header-token' },
      );

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('PUT/DELETEリクエスト', () => {
    it('PUTリクエストでCSRFトークンが一致すれば通過する', () => {
      const token = 'valid-csrf-token';
      const context = createMockExecutionContext(
        'PUT',
        { 'csrf-token': token },
        { 'x-csrf-token': token },
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('PUTリクエストでCSRFトークンが不一致ならForbiddenExceptionをスローする', () => {
      const context = createMockExecutionContext(
        'PUT',
        { 'csrf-token': 'cookie-token' },
        { 'x-csrf-token': 'different-header-token' },
      );

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('DELETEリクエストでCSRFトークンが一致すれば通過する', () => {
      const token = 'valid-csrf-token';
      const context = createMockExecutionContext(
        'DELETE',
        { 'csrf-token': token },
        { 'x-csrf-token': token },
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('DELETEリクエストでCSRFトークンが不一致ならForbiddenExceptionをスローする', () => {
      const context = createMockExecutionContext(
        'DELETE',
        { 'csrf-token': 'cookie-token' },
        { 'x-csrf-token': 'different-header-token' },
      );

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});

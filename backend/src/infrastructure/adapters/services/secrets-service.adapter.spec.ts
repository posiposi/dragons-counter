import { SecretsServiceAdapter } from './secrets-service.adapter';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  GetSecretValueCommand: jest.fn().mockImplementation((input) => input),
}));

describe('SecretsServiceAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('本番環境（NODE_ENV=production）', () => {
    it('Secrets Managerからシークレットを取得する', async () => {
      process.env.NODE_ENV = 'production';
      mockSend.mockResolvedValue({ SecretString: 'my-secret-value' });

      const adapter = new SecretsServiceAdapter();
      const result = await adapter.getSecretValue('my-secret-id');

      expect(result).toBe('my-secret-value');
    });

    it('SecretStringが空の場合にエラーをスローする', async () => {
      process.env.NODE_ENV = 'production';
      mockSend.mockResolvedValue({ SecretString: undefined });

      const adapter = new SecretsServiceAdapter();

      await expect(adapter.getSecretValue('my-secret-id')).rejects.toThrow(
        'Secret my-secret-id has no value',
      );
    });

    it('キャッシュが機能し2回目はクライアントを再呼び出ししない', async () => {
      process.env.NODE_ENV = 'production';
      mockSend.mockResolvedValue({ SecretString: 'cached-value' });

      const adapter = new SecretsServiceAdapter();
      const first = await adapter.getSecretValue('cache-test-id');
      const second = await adapter.getSecretValue('cache-test-id');

      expect(first).toBe('cached-value');
      expect(second).toBe('cached-value');
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('ローカル環境（NODE_ENV未設定）', () => {
    it('環境変数API_GATEWAY_API_KEYからフォールバック取得する', async () => {
      delete process.env.NODE_ENV;
      process.env.API_GATEWAY_API_KEY = 'local-api-key';

      const adapter = new SecretsServiceAdapter();
      const result = await adapter.getSecretValue('any-secret-id');

      expect(result).toBe('local-api-key');
    });

    it('環境変数が未設定の場合にエラーをスローする', async () => {
      delete process.env.NODE_ENV;
      delete process.env.API_GATEWAY_API_KEY;

      const adapter = new SecretsServiceAdapter();

      await expect(adapter.getSecretValue('any-secret-id')).rejects.toThrow(
        'Secret any-secret-id not found in environment variables',
      );
    });
  });
});

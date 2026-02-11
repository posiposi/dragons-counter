import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingAdapter } from './scraping.adapter';
import type { SecretsServicePort } from '../../domain/ports/secrets-service.port';
import type { ScrapeResult } from '../../domain/ports/scraping.port';

describe('ScrapingAdapter', () => {
  let adapter: ScrapingAdapter;
  let secretsService: SecretsServicePort;
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      API_GATEWAY_URL: 'https://api.example.com',
    };
    global.fetch = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapingAdapter,
        {
          provide: 'SecretsServicePort',
          useValue: {
            getSecretValue: jest.fn().mockResolvedValue('test-api-key'),
          },
        },
      ],
    }).compile();

    adapter = module.get<ScrapingAdapter>(ScrapingAdapter);
    secretsService = module.get<SecretsServicePort>('SecretsServicePort');
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('スクレイピング結果（ゲームあり）を返す', async () => {
    const expectedResult: ScrapeResult = {
      game: {
        gameDate: '2024-04-01',
        opponent: '阪神タイガース',
        dragonsScore: 5,
        opponentScore: 3,
        stadium: 'バンテリンドーム ナゴヤ',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(expectedResult),
    });

    const result = await adapter.scrapeGameResult('2024-04-01');

    expect(result).toEqual(expectedResult);
  });

  it('試合なしレスポンスを返す', async () => {
    const expectedResult: ScrapeResult = {
      game: null,
      message: '試合がありませんでした',
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(expectedResult),
    });

    const result = await adapter.scrapeGameResult('2024-04-01');

    expect(result).toEqual(expectedResult);
  });

  it('x-api-keyヘッダーとAbortSignalがリクエストに含まれる', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ game: null, message: 'no game' }),
    });

    await adapter.scrapeGameResult('2024-04-01');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/scrape?date=2024-04-01',
      expect.objectContaining({
        headers: {
          'x-api-key': 'test-api-key',
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('API Gateway URLが未設定の場合エラーをスローする', async () => {
    process.env.API_GATEWAY_URL = '';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapingAdapter,
        {
          provide: 'SecretsServicePort',
          useValue: {
            getSecretValue: jest.fn().mockResolvedValue('test-api-key'),
          },
        },
      ],
    }).compile();

    const adapterWithoutUrl = module.get<ScrapingAdapter>(ScrapingAdapter);

    await expect(
      adapterWithoutUrl.scrapeGameResult('2024-04-01'),
    ).rejects.toThrow('API_GATEWAY_URL is not configured');
  });

  it('HTTPレスポンスがエラーの場合エラー結果を返す', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await adapter.scrapeGameResult('2024-04-01');

    expect(result).toEqual({
      error: 'スクレイピングに失敗しました',
      details: 'HTTP 500',
    });
  });

  it('ネットワークエラーの場合ScrapeErrorResultを返す', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error('fetch failed: network error'),
    );

    const result = await adapter.scrapeGameResult('2024-04-01');

    expect(result).toEqual({
      error: 'スクレイピングに失敗しました',
      details: 'fetch failed: network error',
    });
  });

  it('AbortControllerのsignalがfetchに渡される', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ game: null, message: 'no game' }),
    });

    await adapter.scrapeGameResult('2024-04-01');

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(fetchCall[1].signal).toBeInstanceOf(AbortSignal);
  });

  it('タイムアウトによるAbortErrorの場合タイムアウトエラーを返す', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    (global.fetch as jest.Mock).mockRejectedValue(abortError);

    const result = await adapter.scrapeGameResult('2024-04-01');

    expect(result).toEqual({
      error: 'スクレイピングに失敗しました',
      details: 'リクエストがタイムアウトしました',
    });
  });
});

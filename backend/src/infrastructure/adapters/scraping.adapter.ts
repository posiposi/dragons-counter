import { Inject, Injectable } from '@nestjs/common';
import type {
  ScrapingPort,
  ScrapeResult,
} from '../../domain/ports/scraping.port';
import type { SecretsServicePort } from '../../domain/ports/secrets-service.port';

@Injectable()
export class ScrapingAdapter implements ScrapingPort {
  private static readonly TIMEOUT_MS = 30000;
  private readonly apiGatewayUrl: string;

  constructor(
    @Inject('SecretsServicePort')
    private readonly secretsService: SecretsServicePort,
  ) {
    this.apiGatewayUrl = process.env.API_GATEWAY_URL || '';
  }

  async scrapeGameResult(date: string): Promise<ScrapeResult> {
    if (!this.apiGatewayUrl) {
      throw new Error('API_GATEWAY_URL is not configured');
    }

    const apiKey = await this.secretsService.getSecretValue(
      process.env.SCRAPER_API_KEY_SECRET_ID || 'SCRAPER_API_KEY',
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      ScrapingAdapter.TIMEOUT_MS,
    );

    try {
      const response = await fetch(
        `${this.apiGatewayUrl}/scrape?date=${encodeURIComponent(date)}`,
        {
          headers: {
            'x-api-key': apiKey,
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        return {
          error: 'スクレイピングに失敗しました',
          details: `HTTP ${response.status}`,
        };
      }

      return (await response.json()) as ScrapeResult;
    } catch (error: unknown) {
      const isAbortError =
        error instanceof Error && error.name === 'AbortError';
      const details = isAbortError
        ? 'リクエストがタイムアウトしました'
        : error instanceof Error
          ? error.message
          : '不明なエラー';

      return {
        error: 'スクレイピングに失敗しました',
        details,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

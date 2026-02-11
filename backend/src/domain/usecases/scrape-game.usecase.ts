import { Inject, Injectable } from '@nestjs/common';
import type { ScrapingPort, ScrapeResult } from '../ports/scraping.port';

@Injectable()
export class ScrapeGameUsecase {
  constructor(
    @Inject('ScrapingPort')
    private readonly scrapingPort: ScrapingPort,
  ) {}

  async execute(date: string): Promise<ScrapeResult> {
    return await this.scrapingPort.scrapeGameResult(date);
  }
}

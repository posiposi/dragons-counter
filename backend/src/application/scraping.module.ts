import { Module } from '@nestjs/common';
import { ScrapeGameController } from './controllers/scrape-game.controller';
import { ScrapeGameUsecase } from '../domain/usecases/scrape-game.usecase';
import { ScrapingAdapter } from '../infrastructure/adapters/scraping.adapter';
import { SecretsServiceAdapter } from '../infrastructure/adapters/services/secrets-service.adapter';

@Module({
  controllers: [ScrapeGameController],
  providers: [
    ScrapeGameUsecase,
    {
      provide: 'ScrapingPort',
      useClass: ScrapingAdapter,
    },
    {
      provide: 'SecretsServicePort',
      useClass: SecretsServiceAdapter,
    },
  ],
})
export class ScrapingModule {}

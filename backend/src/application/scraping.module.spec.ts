import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingModule } from './scraping.module';
import { ScrapeGameController } from './controllers/scrape-game.controller';
import { ScrapeGameUsecase } from '../domain/usecases/scrape-game.usecase';
import type { ScrapingPort } from '../domain/ports/scraping.port';
import type { SecretsServicePort } from '../domain/ports/secrets-service.port';

describe('ScrapingModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ScrapingModule],
    }).compile();
  });

  it('ScrapeGameControllerが解決される', () => {
    const controller = module.get<ScrapeGameController>(ScrapeGameController);
    expect(controller).toBeDefined();
  });

  it('ScrapeGameUsecaseが解決される', () => {
    const usecase = module.get<ScrapeGameUsecase>(ScrapeGameUsecase);
    expect(usecase).toBeDefined();
  });

  it('ScrapingPortが解決される', () => {
    const port = module.get<ScrapingPort>('ScrapingPort');
    expect(port).toBeDefined();
  });

  it('SecretsServicePortが解決される', () => {
    const port = module.get<SecretsServicePort>('SecretsServicePort');
    expect(port).toBeDefined();
  });
});

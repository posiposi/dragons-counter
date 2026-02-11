import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingModule } from './scraping.module';
import { ScrapeGameController } from './controllers/scrape-game.controller';
import { ScrapeGameUsecase } from '../domain/usecases/scrape-game.usecase';

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
    const port = module.get('ScrapingPort');
    expect(port).toBeDefined();
  });

  it('SecretsServicePortが解決される', () => {
    const port = module.get('SecretsServicePort');
    expect(port).toBeDefined();
  });
});

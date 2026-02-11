import { Test, TestingModule } from '@nestjs/testing';
import { ScrapeGameUsecase } from './scrape-game.usecase';
import type { ScrapingPort, ScrapeResult } from '../ports/scraping.port';

describe('ScrapeGameUsecase', () => {
  let usecase: ScrapeGameUsecase;
  let scrapingPort: ScrapingPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapeGameUsecase,
        {
          provide: 'ScrapingPort',
          useValue: {
            scrapeGameResult: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<ScrapeGameUsecase>(ScrapeGameUsecase);
    scrapingPort = module.get<ScrapingPort>('ScrapingPort');
  });

  it('ScrapingPortのscrapeGameResultが正しい引数で呼ばれる', async () => {
    const spy = jest
      .spyOn(scrapingPort, 'scrapeGameResult')
      .mockResolvedValue({ game: null, message: 'no game' });

    await usecase.execute('2024-04-01');

    expect(spy).toHaveBeenCalledWith('2024-04-01');
  });

  it('試合データありの結果がそのまま返される', async () => {
    const expectedResult: ScrapeResult = {
      game: {
        gameDate: '2024-04-01',
        opponent: '阪神タイガース',
        dragonsScore: 5,
        opponentScore: 3,
        stadium: 'バンテリンドーム ナゴヤ',
      },
    };

    jest
      .spyOn(scrapingPort, 'scrapeGameResult')
      .mockResolvedValue(expectedResult);

    const result = await usecase.execute('2024-04-01');

    expect(result).toEqual(expectedResult);
  });

  it('試合なしの結果がそのまま返される', async () => {
    const expectedResult: ScrapeResult = {
      game: null,
      message: '試合がありませんでした',
    };

    jest
      .spyOn(scrapingPort, 'scrapeGameResult')
      .mockResolvedValue(expectedResult);

    const result = await usecase.execute('2024-04-01');

    expect(result).toEqual(expectedResult);
  });

  it('エラー結果がそのまま返される', async () => {
    const expectedResult: ScrapeResult = {
      error: 'スクレイピングに失敗しました',
      details: 'HTTP 500',
    };

    jest
      .spyOn(scrapingPort, 'scrapeGameResult')
      .mockResolvedValue(expectedResult);

    const result = await usecase.execute('2024-04-01');

    expect(result).toEqual(expectedResult);
  });
});

import { RequestMethod } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ScrapeGameController } from './scrape-game.controller';
import { ScrapeGameUsecase } from '../../domain/usecases/scrape-game.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { ScrapeResult } from '../../domain/ports/scraping.port';

describe('ScrapeGameController', () => {
  let controller: ScrapeGameController;
  let usecase: ScrapeGameUsecase;

  const scrapeMethod = Object.getOwnPropertyDescriptor(
    ScrapeGameController.prototype,
    'scrape',
  )!.value as (...args: unknown[]) => unknown;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScrapeGameController],
      providers: [
        {
          provide: ScrapeGameUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ScrapeGameController>(ScrapeGameController);
    usecase = module.get<ScrapeGameUsecase>(ScrapeGameUsecase);
  });

  it('UseCaseのexecuteが正しい引数で呼ばれる', async () => {
    const spy = jest
      .spyOn(usecase, 'execute')
      .mockResolvedValue({ game: null, message: 'no game' });

    await controller.scrape({ date: '2024-04-01' });

    expect(spy).toHaveBeenCalledWith('2024-04-01');
  });

  it('試合データありの結果が返される', async () => {
    const expectedResult: ScrapeResult = {
      game: {
        gameDate: '2024-04-01',
        opponent: '阪神タイガース',
        dragonsScore: 5,
        opponentScore: 3,
        stadium: 'バンテリンドーム ナゴヤ',
      },
    };

    jest.spyOn(usecase, 'execute').mockResolvedValue(expectedResult);

    const result = await controller.scrape({ date: '2024-04-01' });

    expect(result).toEqual(expectedResult);
  });

  it('試合なしの結果が返される', async () => {
    const expectedResult: ScrapeResult = {
      game: null,
      message: '試合がありませんでした',
    };

    jest.spyOn(usecase, 'execute').mockResolvedValue(expectedResult);

    const result = await controller.scrape({ date: '2024-04-01' });

    expect(result).toEqual(expectedResult);
  });

  it('JwtAuthGuardが適用されている', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, scrapeMethod) as Array<
      new (...args: unknown[]) => unknown
    >;

    expect(guards).toBeDefined();
    expect(guards).toHaveLength(1);
    expect(guards[0]).toBe(JwtAuthGuard);
  });

  it('POSTメソッドでscrapeパスにマッピングされている', () => {
    const path = Reflect.getMetadata('path', scrapeMethod) as string;
    const method = Reflect.getMetadata('method', scrapeMethod) as RequestMethod;

    expect(path).toBe('/');
    expect(method).toBe(RequestMethod.POST);
  });
});

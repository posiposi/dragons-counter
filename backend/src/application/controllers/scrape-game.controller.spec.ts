import { RequestMethod } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ScrapeGameController } from './scrape-game.controller';
import { ScrapeGameUsecase } from '../../domain/usecases/scrape-game.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';
import { ScrapeGameRequestDto } from '../dto/request/scrape-game-request.dto';
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

    const dto = plainToInstance(ScrapeGameRequestDto, {
      date: '2024-04-01',
    });
    await controller.scrape(dto);

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

    const dto = plainToInstance(ScrapeGameRequestDto, {
      date: '2024-04-01',
    });
    const result = await controller.scrape(dto);

    expect(result).toEqual(expectedResult);
  });

  it('試合なしの結果が返される', async () => {
    const expectedResult: ScrapeResult = {
      game: null,
      message: '試合がありませんでした',
    };

    jest.spyOn(usecase, 'execute').mockResolvedValue(expectedResult);

    const dto = plainToInstance(ScrapeGameRequestDto, {
      date: '2024-04-01',
    });
    const result = await controller.scrape(dto);

    expect(result).toEqual(expectedResult);
  });

  it('JwtAuthGuardとAdminGuardがクラスレベルで適用されている', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      ScrapeGameController,
    ) as Array<new (...args: unknown[]) => unknown>;

    expect(guards).toBeDefined();
    expect(guards).toHaveLength(2);
    expect(guards[0]).toBe(JwtAuthGuard);
    expect(guards[1]).toBe(AdminGuard);
  });

  it('POSTメソッドでscrapeパスにマッピングされている', () => {
    const path = Reflect.getMetadata('path', scrapeMethod) as string;
    const method = Reflect.getMetadata('method', scrapeMethod) as RequestMethod;

    expect(path).toBe('/');
    expect(method).toBe(RequestMethod.POST);
  });
});

describe('ScrapeGameRequestDto', () => {
  it('有効なYYYY-MM-DD形式のdateでバリデーションが通る', async () => {
    const dto = plainToInstance(ScrapeGameRequestDto, {
      date: '2024-04-01',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('dateが空文字の場合バリデーションエラーになる', async () => {
    const dto = plainToInstance(ScrapeGameRequestDto, { date: '' });
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('dateが不正な形式の場合バリデーションエラーになる', async () => {
    const dto = plainToInstance(ScrapeGameRequestDto, {
      date: '2024/04/01',
    });
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const dateError = errors.find((e) => e.property === 'date');
    expect(dateError).toBeDefined();
  });

  it('dateが未指定の場合バリデーションエラーになる', async () => {
    const dto = plainToInstance(ScrapeGameRequestDto, {});
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('dateが数値の場合バリデーションエラーになる', async () => {
    const dto = plainToInstance(ScrapeGameRequestDto, { date: 20240401 });
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});

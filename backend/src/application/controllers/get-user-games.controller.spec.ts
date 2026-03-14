import { RequestMethod } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { GetUserGamesController } from './get-user-games.controller';
import { GetUserGamesUsecase } from '../../domain/usecases/get-user-games.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserGameResponseDto } from '../dto/response/user-game-response.dto';

describe('GetUserGamesController', () => {
  let controller: GetUserGamesController;
  let usecase: GetUserGamesUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetUserGamesController],
      providers: [
        {
          provide: GetUserGamesUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GetUserGamesController>(GetUserGamesController);
    usecase = module.get<GetUserGamesUsecase>(GetUserGamesUsecase);
  });

  describe('getUserGames', () => {
    it('UsecaseのexecuteにuserIdを渡して結果を返す', async () => {
      const mockResponse: UserGameResponseDto[] = [
        {
          id: 'user-game-id-1',
          gameId: 'game-id-1',
          gameDate: '2026-04-01',
          opponent: '阪神タイガース',
          dragonsScore: 5,
          opponentScore: 3,
          result: 'win',
          stadium: 'バンテリンドーム ナゴヤ',
          impression: '素晴らしい試合だった',
          createdAt: '2026-04-01T12:00:00.000Z',
        },
      ];

      const executeSpy = jest
        .spyOn(usecase, 'execute')
        .mockResolvedValue(mockResponse);

      const result = await controller.getUserGames({
        user: { userId: 'test-user-id', email: 'test@example.com' },
      });

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual(mockResponse);
    });
  });

  it('JwtAuthGuardがクラスレベルで適用されている', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      GetUserGamesController,
    ) as Array<new (...args: unknown[]) => unknown>;

    expect(guards).toBeDefined();
    expect(guards).toHaveLength(1);
    expect(guards[0]).toBe(JwtAuthGuard);
  });

  it('GETメソッドでuser-gamesパスにマッピングされている', () => {
    const getUserGamesMethod = Object.getOwnPropertyDescriptor(
      GetUserGamesController.prototype,
      'getUserGames',
    )!.value as (...args: unknown[]) => unknown;

    const path = Reflect.getMetadata('path', getUserGamesMethod) as string;
    const method = Reflect.getMetadata(
      'method',
      getUserGamesMethod,
    ) as RequestMethod;

    expect(path).toBe('/');
    expect(method).toBe(RequestMethod.GET);
  });
});

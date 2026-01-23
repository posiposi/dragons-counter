import { Test, TestingModule } from '@nestjs/testing';
import { CreateGameController } from './create-game.controller';
import { CreateGameUseCase } from '../../domain/usecases/create-game.usecase';
import { CreateGameRequest } from '../dto/request/create-game.dto';

/**
 * CreateGameController テスト
 *
 * NOTE: Issue #75により、試合登録処理は現時点では対応しない。
 * 将来的にスクレイピングで試合データを取得する予定のため、
 * 現在はNotImplementedErrorがスローされることをテストする。
 */
describe('CreateGameController', () => {
  let controller: CreateGameController;
  let createGameUseCase: jest.Mocked<CreateGameUseCase>;

  beforeEach(async () => {
    const mockCreateGameUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateGameController],
      providers: [
        {
          provide: CreateGameUseCase,
          useValue: mockCreateGameUseCase,
        },
      ],
    }).compile();

    controller = module.get<CreateGameController>(CreateGameController);
    createGameUseCase = module.get(CreateGameUseCase);
  });

  describe('create', () => {
    it('should throw NotImplemented error from use case', async () => {
      const dto: CreateGameRequest = {
        gameDate: '2024-04-01',
        opponent: '横浜DeNAベイスターズ',
        dragonsScore: 5,
        opponentScore: 3,
        stadium: 'バンテリンドーム',
        notes: '開幕戦で勝利！',
      };

      const error = new Error(
        'NotImplemented: 試合登録処理は現在対応していません。将来的にスクレイピングで取得予定です。',
      );
      createGameUseCase.execute.mockRejectedValue(error);

      await expect(controller.create(dto)).rejects.toThrow(
        'NotImplemented: 試合登録処理は現在対応していません。将来的にスクレイピングで取得予定です。',
      );
    });

    it('should call use case execute with correct parameters', async () => {
      const dto: CreateGameRequest = {
        gameDate: '2024-04-01',
        opponent: '横浜DeNAベイスターズ',
        dragonsScore: 5,
        opponentScore: 3,
        stadium: 'バンテリンドーム',
        notes: '開幕戦で勝利！',
      };

      createGameUseCase.execute.mockRejectedValue(new Error('NotImplemented'));

      try {
        await controller.create(dto);
      } catch {
        // Expected to throw
      }

      expect(createGameUseCase.execute).toHaveBeenCalledWith({
        gameDate: dto.gameDate,
        opponent: dto.opponent,
        dragonsScore: dto.dragonsScore,
        opponentScore: dto.opponentScore,
        stadium: dto.stadium,
        notes: dto.notes,
      });
    });
  });
});

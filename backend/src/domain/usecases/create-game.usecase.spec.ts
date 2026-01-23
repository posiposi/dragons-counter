import { CreateGameUseCase } from './create-game.usecase';
import { GamePort } from '../ports/game.port';
import { CreateGameRequest } from '../../application/dto/request/create-game.dto';

/**
 * CreateGameUseCase テスト
 *
 * NOTE: Issue #75により、試合登録処理は現時点では対応しない。
 * 将来的にスクレイピングで試合データを取得する予定のため、
 * 現在はNotImplementedErrorがスローされることをテストする。
 */
describe('CreateGameUseCase', () => {
  let useCase: CreateGameUseCase;
  let mockPort: jest.Mocked<GamePort>;

  beforeEach(() => {
    mockPort = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new CreateGameUseCase(mockPort);
  });

  describe('execute', () => {
    it('should throw NotImplemented error', async () => {
      const request: CreateGameRequest = {
        gameDate: '2024-01-15',
        opponent: '阪神タイガース',
        dragonsScore: 5,
        opponentScore: 3,
        stadium: 'バンテリンドーム ナゴヤ',
        notes: '素晴らしい試合でした',
      };

      await expect(() => useCase.execute(request)).rejects.toThrow(
        'NotImplemented: 試合登録処理は現在対応していません。将来的にスクレイピングで取得予定です。',
      );
    });

    it('should not call gamePort.save', async () => {
      const request: CreateGameRequest = {
        gameDate: '2024-01-15',
        opponent: '阪神タイガース',
        dragonsScore: 5,
        opponentScore: 3,
        stadium: 'バンテリンドーム ナゴヤ',
      };

      try {
        await useCase.execute(request);
      } catch {
        // Expected to throw
      }

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockPort.save).not.toHaveBeenCalled();
    });
  });
});

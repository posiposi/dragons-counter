import { DomainException } from './domain-exception';
import { GameNotFoundException } from './game-not-found.exception';

describe('GameNotFoundException', () => {
  it('DomainExceptionを継承していること', () => {
    const exception = new GameNotFoundException(
      '指定された試合が見つかりません',
    );

    expect(exception).toBeInstanceOf(DomainException);
  });

  it('エラーコードがGAME_NOT_FOUNDであること', () => {
    const exception = new GameNotFoundException(
      '指定された試合が見つかりません',
    );

    expect(exception.code).toBe('GAME_NOT_FOUND');
  });

  it('メッセージが正しく設定されること', () => {
    const message = '指定された試合が見つかりません';
    const exception = new GameNotFoundException(message);

    expect(exception.message).toBe(message);
  });
});

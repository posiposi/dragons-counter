import { DomainException } from './domain-exception';
import { UserGameNotFoundException } from './user-game-not-found.exception';

describe('UserGameNotFoundException', () => {
  it('DomainExceptionを継承していること', () => {
    const exception = new UserGameNotFoundException('観戦記録が見つかりません');

    expect(exception).toBeInstanceOf(DomainException);
  });

  it('エラーコードがUSER_GAME_NOT_FOUNDであること', () => {
    const exception = new UserGameNotFoundException('観戦記録が見つかりません');

    expect(exception.code).toBe('USER_GAME_NOT_FOUND');
  });

  it('メッセージが正しく設定されること', () => {
    const message = '観戦記録が見つかりません';
    const exception = new UserGameNotFoundException(message);

    expect(exception.message).toBe(message);
  });
});

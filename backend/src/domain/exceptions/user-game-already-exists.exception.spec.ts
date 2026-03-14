import { DomainException } from './domain-exception';
import { UserGameAlreadyExistsException } from './user-game-already-exists.exception';

describe('UserGameAlreadyExistsException', () => {
  it('DomainExceptionを継承していること', () => {
    const exception = new UserGameAlreadyExistsException(
      'この試合は既に登録されています',
    );

    expect(exception).toBeInstanceOf(DomainException);
  });

  it('エラーコードがUSER_GAME_ALREADY_EXISTSであること', () => {
    const exception = new UserGameAlreadyExistsException(
      'この試合は既に登録されています',
    );

    expect(exception.code).toBe('USER_GAME_ALREADY_EXISTS');
  });

  it('メッセージが正しく設定されること', () => {
    const message = 'この試合は既に登録されています';
    const exception = new UserGameAlreadyExistsException(message);

    expect(exception.message).toBe(message);
  });
});

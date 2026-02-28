import { UserGameId } from './user-game-id';

describe('UserGameId', () => {
  describe('create', () => {
    it('有効な非空文字列でUserGameIdを生成できる', () => {
      const userGameId = UserGameId.create('user-game-id-123');
      expect(userGameId.value).toBe('user-game-id-123');
    });

    it('空文字列でエラーがスローされる', () => {
      expect(() => UserGameId.create('')).toThrow(
        'UserGame ID cannot be empty',
      );
    });

    it('空白のみの文字列でエラーがスローされる', () => {
      expect(() => UserGameId.create('   ')).toThrow(
        'UserGame ID cannot be empty',
      );
    });
  });
});

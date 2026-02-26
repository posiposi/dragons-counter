import { UserGame } from './user-game';
import { UserId } from '../value-objects/user-id';
import { GameId } from '../value-objects/game-id';
import { Impression } from '../value-objects/impression';
import { UserGameId } from '../value-objects/user-game-id';

describe('UserGame', () => {
  describe('createNew', () => {
    it('IDが自動生成されユーザーIDと試合IDを持つUserGameを作成できる', () => {
      const userId = UserId.create('user-1');
      const gameId = new GameId('game-1');

      const userGame = UserGame.createNew(userId, gameId);

      expect(userGame.id).toBeDefined();
      expect(userGame.id.value).toBeTruthy();
      expect(userGame.userId.equals(userId)).toBe(true);
      expect(userGame.gameId.equals(gameId)).toBe(true);
    });

    it('impressionなしで作成するとimpressionがnullになる', () => {
      const userId = UserId.create('user-1');
      const gameId = new GameId('game-1');

      const userGame = UserGame.createNew(userId, gameId);

      expect(userGame.impression).toBeNull();
    });

    it('impressionありで作成できる', () => {
      const userId = UserId.create('user-1');
      const gameId = new GameId('game-1');
      const impression = Impression.create('great game');

      const userGame = UserGame.createNew(userId, gameId, impression);

      expect(userGame.impression!.equals(impression)).toBe(true);
    });

    it('createdAtとupdatedAtが自動設定される', () => {
      const before = new Date();
      const userGame = UserGame.createNew(
        UserId.create('user-1'),
        new GameId('game-1'),
      );
      const after = new Date();

      expect(userGame.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(userGame.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(userGame.updatedAt.getTime()).toEqual(
        userGame.createdAt.getTime(),
      );
    });
  });

  describe('fromRepository', () => {
    it('リポジトリデータからUserGameを復元できる', () => {
      const id = UserGameId.create('ug-1');
      const userId = UserId.create('user-1');
      const gameId = new GameId('game-1');
      const impression = Impression.create('nice win');
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');

      const userGame = UserGame.fromRepository(
        id,
        userId,
        gameId,
        impression,
        createdAt,
        updatedAt,
      );

      expect(userGame.id.equals(id)).toBe(true);
      expect(userGame.userId.equals(userId)).toBe(true);
      expect(userGame.gameId.equals(gameId)).toBe(true);
      expect(userGame.impression!.equals(impression)).toBe(true);
      expect(userGame.createdAt).toBe(createdAt);
      expect(userGame.updatedAt).toBe(updatedAt);
    });
  });

  describe('equals', () => {
    it('IDが同じで他のプロパティが異なるUserGameは等価と判定される', () => {
      const id = UserGameId.create('ug-1');
      const userGame1 = UserGame.fromRepository(
        id,
        UserId.create('user-1'),
        new GameId('game-1'),
        Impression.create('impression A'),
        new Date('2025-01-01'),
        new Date('2025-01-01'),
      );
      const userGame2 = UserGame.fromRepository(
        id,
        UserId.create('user-2'),
        new GameId('game-2'),
        Impression.create('impression B'),
        new Date('2025-06-01'),
        new Date('2025-06-01'),
      );

      expect(userGame1.equals(userGame2)).toBe(true);
    });
  });

  describe('updateImpression', () => {
    it('感想を更新した新しいインスタンスが返され元のインスタンスは変更されない', () => {
      const original = UserGame.fromRepository(
        UserGameId.create('ug-1'),
        UserId.create('user-1'),
        new GameId('game-1'),
        Impression.create('old impression'),
        new Date('2025-01-01'),
        new Date('2025-01-01'),
      );

      const newImpression = Impression.create('new impression');
      const updated = original.updateImpression(newImpression);

      expect(updated).not.toBe(original);
      expect(updated.impression!.equals(newImpression)).toBe(true);
      expect(
        original.impression!.equals(Impression.create('old impression')),
      ).toBe(true);
      expect(updated.id.equals(original.id)).toBe(true);
    });
  });
});

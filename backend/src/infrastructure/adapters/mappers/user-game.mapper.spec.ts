import { UserGameMapper } from './user-game.mapper';
import { UserGameEntity } from '../../typeorm/entities/user-game.entity';
import { UserGame } from '../../../domain/entities/user-game';
import { UserGameId } from '../../../domain/value-objects/user-game-id';
import { UserId } from '../../../domain/value-objects/user-id';
import { GameId } from '../../../domain/value-objects/game-id';
import { Impression } from '../../../domain/value-objects/impression';

describe('UserGameMapper', () => {
  const id = 'user-game-id-1';
  const userId = 'user-id-1';
  const gameId = 'game-id-1';
  const impressionText = 'Great game!';
  const createdAt = new Date('2026-01-01T00:00:00Z');
  const updatedAt = new Date('2026-01-02T00:00:00Z');

  describe('toDomainEntity', () => {
    it('impression有りのUserGameEntityを正しくドメインエンティティに変換できる', () => {
      const entity = new UserGameEntity();
      entity.id = id;
      entity.userId = userId;
      entity.gameId = gameId;
      entity.impression = impressionText;
      entity.createdAt = createdAt;
      entity.updatedAt = updatedAt;

      const result = UserGameMapper.toDomainEntity(entity);

      expect(result.id.value).toBe(id);
      expect(result.userId.value).toBe(userId);
      expect(result.gameId.value).toBe(gameId);
      expect(result.impression).not.toBeNull();
      expect(result.impression!.value).toBe(impressionText);
      expect(result.createdAt).toEqual(createdAt);
      expect(result.updatedAt).toEqual(updatedAt);
    });

    it('impression無し（null）のUserGameEntityを正しく変換できる', () => {
      const entity = new UserGameEntity();
      entity.id = id;
      entity.userId = userId;
      entity.gameId = gameId;
      entity.impression = null;
      entity.createdAt = createdAt;
      entity.updatedAt = updatedAt;

      const result = UserGameMapper.toDomainEntity(entity);

      expect(result.id.value).toBe(id);
      expect(result.userId.value).toBe(userId);
      expect(result.gameId.value).toBe(gameId);
      expect(result.impression).toBeNull();
    });

    it('impression が空文字のUserGameEntityをnullに正規化して変換できる', () => {
      const entity = new UserGameEntity();
      entity.id = id;
      entity.userId = userId;
      entity.gameId = gameId;
      entity.impression = '' as string | null;
      entity.createdAt = createdAt;
      entity.updatedAt = updatedAt;

      const result = UserGameMapper.toDomainEntity(entity);

      expect(result.impression).toBeNull();
    });
  });

  describe('toPersistence', () => {
    it('impression有りのUserGameを正しく永続化モデルに変換できる', () => {
      const domain = UserGame.fromRepository(
        UserGameId.create(id),
        UserId.create(userId),
        new GameId(gameId),
        Impression.create(impressionText),
        createdAt,
        updatedAt,
      );

      const result = UserGameMapper.toPersistence(domain);

      expect(result.id).toBe(id);
      expect(result.userId).toBe(userId);
      expect(result.gameId).toBe(gameId);
      expect(result.impression).toBe(impressionText);
      expect(result.createdAt).toEqual(createdAt);
      expect(result.updatedAt).toEqual(updatedAt);
    });

    it('impression無し（null）のUserGameでimpressionがnullになる', () => {
      const domain = UserGame.fromRepository(
        UserGameId.create(id),
        UserId.create(userId),
        new GameId(gameId),
        null,
        createdAt,
        updatedAt,
      );

      const result = UserGameMapper.toPersistence(domain);

      expect(result.impression).toBeNull();
    });
  });
});

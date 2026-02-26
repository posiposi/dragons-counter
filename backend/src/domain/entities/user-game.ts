import { randomUUID } from 'crypto';
import { UserGameId } from '../value-objects/user-game-id';
import { UserId } from '../value-objects/user-id';
import { GameId } from '../value-objects/game-id';
import { Impression } from '../value-objects/impression';

export class UserGame {
  private readonly _id: UserGameId;
  private readonly _userId: UserId;
  private readonly _gameId: GameId;
  private readonly _impression: Impression | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(
    id: UserGameId,
    userId: UserId,
    gameId: GameId,
    impression: Impression | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._id = id;
    this._userId = userId;
    this._gameId = gameId;
    this._impression = impression;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  static createNew(
    userId: UserId,
    gameId: GameId,
    impression?: Impression,
  ): UserGame {
    const id = UserGameId.create(randomUUID());
    const now = new Date();
    return new UserGame(id, userId, gameId, impression ?? null, now, now);
  }

  static fromRepository(
    id: UserGameId,
    userId: UserId,
    gameId: GameId,
    impression: Impression | null,
    createdAt: Date,
    updatedAt: Date,
  ): UserGame {
    return new UserGame(id, userId, gameId, impression, createdAt, updatedAt);
  }

  get id(): UserGameId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get gameId(): GameId {
    return this._gameId;
  }

  get impression(): Impression | null {
    return this._impression;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  equals(other: UserGame): boolean {
    return this._id.equals(other._id);
  }

  updateImpression(newImpression: Impression): UserGame {
    return new UserGame(
      this._id,
      this._userId,
      this._gameId,
      newImpression,
      this._createdAt,
      new Date(),
    );
  }
}

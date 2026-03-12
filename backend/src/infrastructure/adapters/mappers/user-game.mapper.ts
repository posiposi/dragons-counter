import { UserGame } from '../../../domain/entities/user-game';
import { UserGameId } from '../../../domain/value-objects/user-game-id';
import { UserId } from '../../../domain/value-objects/user-id';
import { GameId } from '../../../domain/value-objects/game-id';
import { Impression } from '../../../domain/value-objects/impression';
import { UserGameEntity } from '../../typeorm/entities/user-game.entity';

export class UserGameMapper {
  static toDomainEntity(data: UserGameEntity): UserGame {
    const impression = Impression.create(data.impression);

    return UserGame.fromRepository(
      UserGameId.create(data.id),
      UserId.create(data.userId),
      new GameId(data.gameId),
      impression.isEmpty() ? null : impression,
      data.createdAt,
      data.updatedAt,
    );
  }

  static toPersistence(userGame: UserGame): Partial<UserGameEntity> {
    return {
      id: userGame.id.value,
      userId: userGame.userId.value,
      gameId: userGame.gameId.value,
      impression: userGame.impression?.value ?? null,
      createdAt: userGame.createdAt,
      updatedAt: userGame.updatedAt,
    };
  }
}

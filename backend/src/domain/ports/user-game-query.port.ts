import { UserGame } from '../entities/user-game';
import { UserId } from '../value-objects/user-id';
import { GameId } from '../value-objects/game-id';

export interface UserGameQueryPort {
  findByUserId(userId: UserId): Promise<UserGame[]>;
  findByUserIdAndGameId(
    userId: UserId,
    gameId: GameId,
  ): Promise<UserGame | null>;
}

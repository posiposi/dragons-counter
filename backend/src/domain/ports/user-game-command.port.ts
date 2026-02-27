import { UserGame } from '../entities/user-game';
import { UserId } from '../value-objects/user-id';
import { GameId } from '../value-objects/game-id';

export interface UserGameCommandPort {
  save(userGame: UserGame): Promise<UserGame>;
  softDelete(userId: UserId, gameId: GameId): Promise<void>;
}

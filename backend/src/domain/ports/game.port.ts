import { Game } from '../entities/game';
import { GameId } from '../value-objects/game-id';

export interface GamePort {
  save(game: Game): Promise<Game>;
  findAll(): Promise<Game[]>;
  findById(gameId: GameId): Promise<Game | null>;
  softDelete(gameId: GameId): Promise<boolean>;
}

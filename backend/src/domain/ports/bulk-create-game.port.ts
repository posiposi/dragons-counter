import { Game } from '../entities/game';

export interface BulkCreateGamePort {
  save(game: Game): Promise<void>;
}

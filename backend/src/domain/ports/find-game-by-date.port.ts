import { Game } from '../entities/game';
import { GameDate } from '../value-objects/game-date';

export interface FindGameByDatePort {
  findByDate(gameDate: GameDate): Promise<Game | null>;
}

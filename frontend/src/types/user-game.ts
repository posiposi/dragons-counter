import { GameResult } from "./game";

export interface UserGame {
  id: string;
  gameId: string;
  gameDate: string;
  opponent: string;
  dragonsScore: number;
  opponentScore: number;
  result: GameResult;
  stadium: string;
  impression: string | null;
  createdAt: string;
}

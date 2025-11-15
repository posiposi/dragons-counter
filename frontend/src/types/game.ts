export type GameResult = "win" | "lose" | "draw";

export interface Game {
  id: string;
  gameDate: string;
  opponent: string;
  dragonsScore: number;
  opponentScore: number;
  result: GameResult;
  stadium: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetGamesResponse {
  games: Game[];
  total: number;
  page: number;
  limit: number;
}

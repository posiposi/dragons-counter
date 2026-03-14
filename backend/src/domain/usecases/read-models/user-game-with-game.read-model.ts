export interface UserGameWithGameReadModel {
  id: string;
  gameId: string;
  gameDate: string;
  opponent: string;
  dragonsScore: number;
  opponentScore: number;
  result: string;
  stadium: string;
  impression: string | null;
  createdAt: string;
}

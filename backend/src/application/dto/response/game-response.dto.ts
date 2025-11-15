export interface GameResponseDto {
  id: string;
  gameDate: string;
  opponent: string;
  dragonsScore: number;
  opponentScore: number;
  result: string;
  stadium: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

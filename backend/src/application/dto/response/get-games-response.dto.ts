import { GameResponseDto } from './game-response.dto';

export class GetGamesResponseDto {
  games: GameResponseDto[];

  constructor(games: GameResponseDto[]) {
    this.games = games;
  }

  static fromArray(games: GameResponseDto[]): GetGamesResponseDto {
    return new GetGamesResponseDto(games);
  }
}

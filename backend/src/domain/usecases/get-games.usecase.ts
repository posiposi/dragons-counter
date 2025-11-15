import { Injectable, Inject } from '@nestjs/common';
import type { GamePort } from '../ports/game.port';
import { Game } from '../entities/game';
import { GameResponseDto } from '../../application/dto/response/game-response.dto';

@Injectable()
export class GetGamesUsecase {
  constructor(@Inject('GamePort') private readonly gamePort: GamePort) {}

  async execute(): Promise<GameResponseDto[]> {
    const games = await this.gamePort.findAll();
    return games.map((game) => this.toDto(game));
  }

  private toDto(game: Game): GameResponseDto {
    return {
      id: game.id.value,
      gameDate: game.gameDate.format(),
      opponent: game.opponent.value,
      dragonsScore: game.dragonsScore.value,
      opponentScore: game.opponentScore.value,
      result: game.result.value.toLowerCase(),
      stadium: game.stadium.value,
      notes: game.notes?.value || null,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
    };
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { UserGameQueryPort } from '../ports/user-game-query.port';
import type { GamePort } from '../ports/game.port';
import { UserGame } from '../entities/user-game';
import { Game } from '../entities/game';
import { UserId } from '../value-objects/user-id';
import { UserGameResponseDto } from '../../application/dto/response/user-game-response.dto';

@Injectable()
export class GetUserGamesUsecase {
  constructor(
    @Inject('UserGameQueryPort')
    private readonly userGameQueryPort: UserGameQueryPort,
    @Inject('GamePort') private readonly gamePort: GamePort,
  ) {}

  async execute(userId: string): Promise<UserGameResponseDto[]> {
    const userIdVO = UserId.create(userId);
    const userGames = await this.userGameQueryPort.findByUserId(userIdVO);

    const dtos: UserGameResponseDto[] = [];
    for (const userGame of userGames) {
      const game = await this.gamePort.findById(userGame.gameId);
      if (game) {
        dtos.push(this.toDto(userGame, game));
      }
    }
    return dtos;
  }

  private toDto(userGame: UserGame, game: Game): UserGameResponseDto {
    return {
      id: userGame.id.value,
      gameId: game.id.value,
      gameDate: game.gameDate.format(),
      opponent: game.opponent.value,
      dragonsScore: game.dragonsScore.value,
      opponentScore: game.opponentScore.value,
      result: game.result.value.toLowerCase(),
      stadium: game.stadium.name.value,
      impression: userGame.impression?.value ?? null,
      createdAt: userGame.createdAt.toISOString(),
    };
  }
}

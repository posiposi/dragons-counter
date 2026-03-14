import { Injectable, Inject } from '@nestjs/common';
import type { UserGameQueryPort } from '../ports/user-game-query.port';
import type { GamePort } from '../ports/game.port';
import { UserGame } from '../entities/user-game';
import { Game } from '../entities/game';
import { UserId } from '../value-objects/user-id';
import { UserGameWithGameReadModel } from './read-models/user-game-with-game.read-model';
import { GameNotFoundException } from '../exceptions/game-not-found.exception';

@Injectable()
export class GetUserGamesUsecase {
  constructor(
    @Inject('UserGameQueryPort')
    private readonly userGameQueryPort: UserGameQueryPort,
    @Inject('GamePort') private readonly gamePort: GamePort,
  ) {}

  async execute(userId: string): Promise<UserGameWithGameReadModel[]> {
    const userIdVO = UserId.create(userId);
    const userGames = await this.userGameQueryPort.findByUserId(userIdVO);

    if (userGames.length === 0) {
      return [];
    }

    const gameIds = userGames.map((ug) => ug.gameId);
    const games = await this.gamePort.findByIds(gameIds);
    const gameMap = new Map<string, Game>(
      games.map((game) => [game.id.value, game]),
    );

    const missingGameIds = gameIds.filter(
      (gameId) => !gameMap.has(gameId.value),
    );
    if (missingGameIds.length > 0) {
      throw new GameNotFoundException('関連する試合情報が見つかりません');
    }

    return userGames.map((userGame) => {
      const game = gameMap.get(userGame.gameId.value)!;
      return this.toDto(userGame, game);
    });
  }

  private toDto(userGame: UserGame, game: Game): UserGameWithGameReadModel {
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

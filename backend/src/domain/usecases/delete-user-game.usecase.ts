import { Injectable, Inject } from '@nestjs/common';
import type { UserGameCommandPort } from '../ports/user-game-command.port';
import type { UserGameQueryPort } from '../ports/user-game-query.port';
import { UserId } from '../value-objects/user-id';
import { GameId } from '../value-objects/game-id';
import { UserGameNotFoundException } from '../exceptions/user-game-not-found.exception';

@Injectable()
export class DeleteUserGameUsecase {
  constructor(
    @Inject('UserGameCommandPort')
    private readonly userGameCommandPort: UserGameCommandPort,
    @Inject('UserGameQueryPort')
    private readonly userGameQueryPort: UserGameQueryPort,
  ) {}

  async execute(userId: string, gameId: string): Promise<void> {
    const userIdVO = UserId.create(userId);
    const gameIdVO = new GameId(gameId);

    const userGame = await this.userGameQueryPort.findByUserIdAndGameId(
      userIdVO,
      gameIdVO,
    );
    if (!userGame) {
      throw new UserGameNotFoundException('観戦記録が見つかりません');
    }

    await this.userGameCommandPort.softDelete(userIdVO, gameIdVO);
  }
}

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { UserGameCommandPort } from '../ports/user-game-command.port';
import type { UserGameQueryPort } from '../ports/user-game-query.port';
import type { GamePort } from '../ports/game.port';
import { UserId } from '../value-objects/user-id';
import { GameId } from '../value-objects/game-id';
import { UserGame } from '../entities/user-game';
import { UserGameAlreadyExistsException } from '../exceptions/user-game-already-exists.exception';

@Injectable()
export class RegisterUserGameUsecase {
  constructor(
    @Inject('UserGameCommandPort')
    private readonly userGameCommandPort: UserGameCommandPort,
    @Inject('UserGameQueryPort')
    private readonly userGameQueryPort: UserGameQueryPort,
    @Inject('GamePort')
    private readonly gamePort: GamePort,
  ) {}

  async execute(userId: string, gameId: string): Promise<void> {
    const userIdVO = UserId.create(userId);
    const gameIdVO = new GameId(gameId);

    const game = await this.gamePort.findById(gameIdVO);
    if (!game) {
      throw new NotFoundException('指定された試合が見つかりません');
    }

    const existingUserGame = await this.userGameQueryPort.findByUserIdAndGameId(
      userIdVO,
      gameIdVO,
    );
    if (existingUserGame) {
      throw new UserGameAlreadyExistsException(
        'この試合は既に観戦登録されています',
      );
    }

    const userGame = UserGame.createNew(userIdVO, gameIdVO);
    await this.userGameCommandPort.save(userGame);
  }
}

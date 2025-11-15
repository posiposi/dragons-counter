import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import type { GamePort } from '../ports/game.port';
import { GameId } from '../value-objects/game-id';

@Injectable()
export class DeleteGameUsecase {
  constructor(
    @Inject('GamePort')
    private readonly gamePort: GamePort,
  ) {}

  async execute(gameId: string): Promise<void> {
    const gameIdVO = new GameId(gameId);
    const game = await this.gamePort.findById(gameIdVO);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const result = await this.gamePort.softDelete(gameIdVO);

    if (!result) {
      throw new InternalServerErrorException('Failed to delete game');
    }
  }
}

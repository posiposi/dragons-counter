import { Inject, Injectable } from '@nestjs/common';
import type { BulkCreateGamePort } from '../ports/bulk-create-game.port';
import type { FindGameByDatePort } from '../ports/find-game-by-date.port';
import { GameInputDto } from '../../application/dto/request/bulk-create-game.dto';
import { Game } from '../entities/game';
import { GameId } from '../value-objects/game-id';
import { GameDate } from '../value-objects/game-date';
import { Opponent } from '../value-objects/opponent';
import { Score } from '../value-objects/score';
import { Stadium } from '../value-objects/stadium';
import { StadiumId } from '../value-objects/stadium-id';
import { StadiumName } from '../value-objects/stadium-name';
import { randomUUID } from 'crypto';

export interface BulkCreateGameResult {
  savedCount: number;
  skippedCount: number;
  errors: string[];
}

@Injectable()
export class BulkCreateGameUsecase {
  constructor(
    @Inject('BulkCreateGamePort')
    private readonly bulkCreateGamePort: BulkCreateGamePort,
    @Inject('FindGameByDatePort')
    private readonly findGameByDatePort: FindGameByDatePort,
  ) {}

  async execute(
    inputs: GameInputDto[],
    stadiumId: string,
  ): Promise<BulkCreateGameResult> {
    let savedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const input of inputs) {
      const gameDate = new GameDate(new Date(input.gameDate));

      const existingGame = await this.findGameByDatePort.findByDate(gameDate);
      if (existingGame) {
        skippedCount++;
        continue;
      }

      try {
        const game = this.createGameEntity(input, stadiumId);
        await this.bulkCreateGamePort.save(game);
        savedCount++;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to save game for ${input.gameDate}: ${message}`);
      }
    }

    return { savedCount, skippedCount, errors };
  }

  private createGameEntity(input: GameInputDto, stadiumId: string): Game {
    return new Game(
      new GameId(randomUUID()),
      new GameDate(new Date(input.gameDate)),
      new Opponent(input.opponent),
      new Score(input.dragonsScore),
      new Score(input.opponentScore),
      Stadium.create(
        StadiumId.create(stadiumId),
        StadiumName.create(input.stadium),
      ),
      undefined,
      new Date(),
      new Date(),
    );
  }
}

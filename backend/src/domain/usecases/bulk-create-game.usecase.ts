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

const STADIUM_NAME_TO_ID: Record<string, string> = {
  バンテリンドーム: 'a1b2c3d4-e5f6-7890-abcd-ef1234567001',
  'バンテリンドーム ナゴヤ': 'a1b2c3d4-e5f6-7890-abcd-ef1234567001',
  神宮球場: 'a1b2c3d4-e5f6-7890-abcd-ef1234567002',
  明治神宮野球場: 'a1b2c3d4-e5f6-7890-abcd-ef1234567002',
  神宮: 'a1b2c3d4-e5f6-7890-abcd-ef1234567002',
  甲子園球場: 'a1b2c3d4-e5f6-7890-abcd-ef1234567003',
  阪神甲子園球場: 'a1b2c3d4-e5f6-7890-abcd-ef1234567003',
  甲子園: 'a1b2c3d4-e5f6-7890-abcd-ef1234567003',
  東京ドーム: 'a1b2c3d4-e5f6-7890-abcd-ef1234567004',
  横浜スタジアム: 'a1b2c3d4-e5f6-7890-abcd-ef1234567005',
  横浜: 'a1b2c3d4-e5f6-7890-abcd-ef1234567005',
  マツダスタジアム: 'a1b2c3d4-e5f6-7890-abcd-ef1234567006',
  'MAZDA Zoom-Zoom スタジアム広島': 'a1b2c3d4-e5f6-7890-abcd-ef1234567006',
};

const DEFAULT_STADIUM_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567001';

@Injectable()
export class BulkCreateGameUsecase {
  constructor(
    @Inject('BulkCreateGamePort')
    private readonly bulkCreateGamePort: BulkCreateGamePort,
    @Inject('FindGameByDatePort')
    private readonly findGameByDatePort: FindGameByDatePort,
  ) {}

  async execute(inputs: GameInputDto[]): Promise<BulkCreateGameResult> {
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
        const game = this.createGameEntity(input);
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

  private createGameEntity(input: GameInputDto): Game {
    const stadiumId = this.resolveStadiumId(input.stadium);

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

  private resolveStadiumId(stadiumName: string): string {
    const stadiumId = STADIUM_NAME_TO_ID[stadiumName];
    if (stadiumId) {
      return stadiumId;
    }

    // 部分一致で検索
    for (const [name, id] of Object.entries(STADIUM_NAME_TO_ID)) {
      if (stadiumName.includes(name) || name.includes(stadiumName)) {
        return id;
      }
    }

    // デフォルトはバンテリンドーム
    return DEFAULT_STADIUM_ID;
  }
}

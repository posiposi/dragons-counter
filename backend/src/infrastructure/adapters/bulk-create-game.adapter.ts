import { Injectable } from '@nestjs/common';
import { BulkCreateGamePort } from '../../domain/ports/bulk-create-game.port';
import { PrismaClient } from '@prisma/client';
import { Game } from '../../domain/entities/game';

@Injectable()
export class BulkCreateGameAdapter implements BulkCreateGamePort {
  constructor(private readonly prisma: PrismaClient) {}

  async save(game: Game): Promise<void> {
    await this.prisma.game.create({
      data: {
        id: game.id.value,
        gameDate: game.gameDate.value,
        opponent: game.opponent.value,
        dragonsScore: game.dragonsScore.value,
        opponentScore: game.opponentScore.value,
        stadiumId: game.stadium.id.value,
        result: game.result.value,
        notes: game.notes?.value || null,
      },
    });
  }
}

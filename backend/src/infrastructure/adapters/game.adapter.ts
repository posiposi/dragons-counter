import { Injectable } from '@nestjs/common';
import { GamePort } from '../../domain/ports/game.port';
import { PrismaClient, Game as PrismaGame } from '@prisma/client';
import { Game } from '../../domain/entities/game';
import { GameId } from '../../domain/value-objects/game-id';
import { Score } from '../../domain/value-objects/score';
import { Opponent } from '../../domain/value-objects/opponent';
import { Stadium } from '../../domain/value-objects/stadium';
import { Notes } from '../../domain/value-objects/notes';
import { GameDate } from '../../domain/value-objects/game-date';

@Injectable()
export class GameAdapter implements GamePort {
  constructor(private readonly prisma: PrismaClient) {}

  async save(game: Game): Promise<Game> {
    const savedGame = await this.prisma.game.upsert({
      where: {
        id: game.id.value,
      },
      update: {
        gameDate: game.gameDate.value,
        opponent: game.opponent.value,
        dragonsScore: game.dragonsScore.value,
        opponentScore: game.opponentScore.value,
        stadium: game.stadium.value,
        result: game.result.value,
        notes: game.notes?.value || null,
        updatedAt: new Date(),
      },
      create: {
        id: game.id.value,
        gameDate: game.gameDate.value,
        opponent: game.opponent.value,
        dragonsScore: game.dragonsScore.value,
        opponentScore: game.opponentScore.value,
        stadium: game.stadium.value,
        result: game.result.value,
        notes: game.notes?.value || null,
      },
    });

    return this.toDomainEntity(savedGame);
  }

  async findAll(): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        gameDate: 'desc',
      },
    });

    return games.map((game) => this.toDomainEntity(game));
  }

  async findById(gameId: GameId): Promise<Game | null> {
    const game = await this.prisma.game.findFirst({
      where: {
        id: gameId.value,
        deletedAt: null,
      },
    });

    if (!game) {
      return null;
    }

    return this.toDomainEntity(game);
  }

  async softDelete(gameId: GameId): Promise<boolean> {
    try {
      await this.prisma.game.update({
        where: {
          id: gameId.value,
        },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  private toDomainEntity(data: PrismaGame): Game {
    return new Game(
      new GameId(data.id),
      new GameDate(data.gameDate),
      new Opponent(data.opponent),
      new Score(data.dragonsScore),
      new Score(data.opponentScore),
      new Stadium(data.stadium),
      data.notes ? new Notes(data.notes) : undefined,
      data.createdAt,
      data.updatedAt,
    );
  }
}

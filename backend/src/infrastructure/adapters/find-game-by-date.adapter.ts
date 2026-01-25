import { Injectable } from '@nestjs/common';
import { FindGameByDatePort } from '../../domain/ports/find-game-by-date.port';
import {
  PrismaClient,
  Game as PrismaGame,
  Stadium as PrismaStadium,
} from '@prisma/client';
import { Game } from '../../domain/entities/game';
import { GameId } from '../../domain/value-objects/game-id';
import { Score } from '../../domain/value-objects/score';
import { Opponent } from '../../domain/value-objects/opponent';
import { Stadium } from '../../domain/value-objects/stadium';
import { StadiumId } from '../../domain/value-objects/stadium-id';
import { StadiumName } from '../../domain/value-objects/stadium-name';
import { Notes } from '../../domain/value-objects/notes';
import { GameDate } from '../../domain/value-objects/game-date';

type PrismaGameWithStadium = PrismaGame & { stadium: PrismaStadium };

@Injectable()
export class FindGameByDateAdapter implements FindGameByDatePort {
  constructor(private readonly prisma: PrismaClient) {}

  async findByDate(gameDate: GameDate): Promise<Game | null> {
    const game = await this.prisma.game.findFirst({
      where: {
        gameDate: gameDate.value,
        deletedAt: null,
      },
      include: {
        stadium: true,
      },
    });

    if (!game) {
      return null;
    }

    return this.toDomainEntity(game);
  }

  private toDomainEntity(data: PrismaGameWithStadium): Game {
    const stadium = Stadium.create(
      StadiumId.create(data.stadium.id),
      StadiumName.create(data.stadium.name),
    );

    return new Game(
      new GameId(data.id),
      new GameDate(data.gameDate),
      new Opponent(data.opponent),
      new Score(data.dragonsScore),
      new Score(data.opponentScore),
      stadium,
      data.notes ? new Notes(data.notes) : undefined,
      data.createdAt,
      data.updatedAt,
    );
  }
}

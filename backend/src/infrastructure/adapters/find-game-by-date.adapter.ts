import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { FindGameByDatePort } from '../../domain/ports/find-game-by-date.port';
import { Game } from '../../domain/entities/game';
import { GameId } from '../../domain/value-objects/game-id';
import { Score } from '../../domain/value-objects/score';
import { Opponent } from '../../domain/value-objects/opponent';
import { Stadium } from '../../domain/value-objects/stadium';
import { StadiumId } from '../../domain/value-objects/stadium-id';
import { StadiumName } from '../../domain/value-objects/stadium-name';
import { Notes } from '../../domain/value-objects/notes';
import { GameDate } from '../../domain/value-objects/game-date';
import { GameEntity } from '../typeorm/entities/game.entity';

@Injectable()
export class FindGameByDateAdapter implements FindGameByDatePort {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
  ) {}

  async findByDate(gameDate: GameDate): Promise<Game | null> {
    const game = await this.gameRepository.findOne({
      where: {
        gameDate: gameDate.value,
        deletedAt: IsNull(),
      },
      relations: ['stadium'],
    });

    if (!game) {
      return null;
    }

    return this.toDomainEntity(game);
  }

  private toDomainEntity(data: GameEntity): Game {
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

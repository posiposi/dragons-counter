import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { GamePort } from '../../domain/ports/game.port';
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
import { GameResultEnum } from '../typeorm/enums/game-result.enum';
import { GameResultValue } from '../../domain/value-objects/game-result';

@Injectable()
export class GameAdapter implements GamePort {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
  ) {}

  async save(game: Game): Promise<Game> {
    const entityData = this.toPersistence(game);
    const entity = this.gameRepository.create(entityData);
    await this.gameRepository.save(entity);

    const savedGame = await this.gameRepository.findOne({
      where: { id: game.id.value },
      relations: ['stadium'],
    });

    return this.toDomainEntity(savedGame!);
  }

  async findAll(): Promise<Game[]> {
    const games = await this.gameRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['stadium'],
      order: { gameDate: 'DESC' },
    });

    return games.map((game) => this.toDomainEntity(game));
  }

  async findById(gameId: GameId): Promise<Game | null> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId.value, deletedAt: IsNull() },
      relations: ['stadium'],
    });

    if (!game) {
      return null;
    }

    return this.toDomainEntity(game);
  }

  async softDelete(gameId: GameId): Promise<boolean> {
    const result = await this.gameRepository.update(
      { id: gameId.value },
      { deletedAt: new Date() },
    );

    return (result.affected ?? 0) > 0;
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

  private toPersistence(game: Game): Partial<GameEntity> {
    return {
      id: game.id.value,
      gameDate: game.gameDate.value,
      opponent: game.opponent.value,
      dragonsScore: game.dragonsScore.value,
      opponentScore: game.opponentScore.value,
      stadiumId: game.stadium.id.value,
      result: this.toGameResultEnum(game.result.value),
      notes: game.notes?.value || null,
    };
  }

  private toGameResultEnum(value: GameResultValue): GameResultEnum {
    const map: Record<GameResultValue, GameResultEnum> = {
      [GameResultValue.WIN]: GameResultEnum.WIN,
      [GameResultValue.LOSE]: GameResultEnum.LOSE,
      [GameResultValue.DRAW]: GameResultEnum.DRAW,
    };
    return map[value];
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BulkCreateGamePort } from '../../domain/ports/bulk-create-game.port';
import { Game } from '../../domain/entities/game';
import { GameEntity } from '../typeorm/entities/game.entity';
import { GameResultEnum } from '../typeorm/enums/game-result.enum';
import { GameResultValue } from '../../domain/value-objects/game-result';

@Injectable()
export class BulkCreateGameAdapter implements BulkCreateGamePort {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
  ) {}

  async save(game: Game): Promise<void> {
    const entity = this.gameRepository.create({
      id: game.id.value,
      gameDate: game.gameDate.value,
      opponent: game.opponent.value,
      dragonsScore: game.dragonsScore.value,
      opponentScore: game.opponentScore.value,
      stadiumId: game.stadium.id.value,
      result: this.toGameResultEnum(game.result.value),
      notes: game.notes?.value || null,
    });

    await this.gameRepository.save(entity);
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

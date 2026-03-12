import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGameQueryPort } from '../../domain/ports/user-game-query.port';
import { UserGame } from '../../domain/entities/user-game';
import { UserId } from '../../domain/value-objects/user-id';
import { GameId } from '../../domain/value-objects/game-id';
import { UserGameEntity } from '../typeorm/entities/user-game.entity';
import { UserGameMapper } from './mappers/user-game.mapper';

@Injectable()
export class UserGameQueryAdapter implements UserGameQueryPort {
  constructor(
    @InjectRepository(UserGameEntity)
    private readonly userGameRepository: Repository<UserGameEntity>,
  ) {}

  async findByUserId(userId: UserId): Promise<UserGame[]> {
    const userGameEntities = await this.userGameRepository.find({
      where: { userId: userId.value },
    });

    return userGameEntities.map((userGameEntity) =>
      UserGameMapper.toDomainEntity(userGameEntity),
    );
  }

  async findByUserIdAndGameId(
    userId: UserId,
    gameId: GameId,
  ): Promise<UserGame | null> {
    const entity = await this.userGameRepository.findOne({
      where: { userId: userId.value, gameId: gameId.value },
    });

    if (!entity) {
      return null;
    }

    return UserGameMapper.toDomainEntity(entity);
  }
}

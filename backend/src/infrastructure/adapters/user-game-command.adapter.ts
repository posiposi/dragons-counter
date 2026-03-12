import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGameCommandPort } from '../../domain/ports/user-game-command.port';
import { UserGame } from '../../domain/entities/user-game';
import { UserId } from '../../domain/value-objects/user-id';
import { GameId } from '../../domain/value-objects/game-id';
import { UserGameEntity } from '../typeorm/entities/user-game.entity';
import { UserGameMapper } from './mappers/user-game.mapper';

@Injectable()
export class UserGameCommandAdapter implements UserGameCommandPort {
  constructor(
    @InjectRepository(UserGameEntity)
    private readonly userGameRepository: Repository<UserGameEntity>,
  ) {}

  async save(userGame: UserGame): Promise<UserGame> {
    const entity = this.userGameRepository.create(
      UserGameMapper.toPersistence(userGame),
    );
    const savedUserGame = await this.userGameRepository.save(entity);
    return UserGameMapper.toDomainEntity(savedUserGame);
  }

  async softDelete(userId: UserId, gameId: GameId): Promise<void> {
    await this.userGameRepository.softDelete({
      userId: userId.value,
      gameId: gameId.value,
    });
  }
}

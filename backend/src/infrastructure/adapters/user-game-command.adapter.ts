import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { UserGameCommandPort } from '../../domain/ports/user-game-command.port';
import { UserGame } from '../../domain/entities/user-game';
import { UserId } from '../../domain/value-objects/user-id';
import { GameId } from '../../domain/value-objects/game-id';
import { UserGameAlreadyExistsException } from '../../domain/exceptions/user-game-already-exists.exception';
import { UserGameEntity } from '../typeorm/entities/user-game.entity';
import { UserGameMapper } from './mappers/user-game.mapper';

@Injectable()
export class UserGameCommandAdapter implements UserGameCommandPort {
  constructor(
    @InjectRepository(UserGameEntity)
    private readonly userGameRepository: Repository<UserGameEntity>,
  ) {}

  async save(userGame: UserGame): Promise<UserGame> {
    try {
      const existing = await this.userGameRepository.findOne({
        where: {
          userId: userGame.userId.value,
          gameId: userGame.gameId.value,
        },
        withDeleted: true,
      });

      if (existing) {
        existing.impression = userGame.impression?.value ?? null;
        if (existing.deletedAt) {
          existing.deletedAt = null;
        }
        const updatedUserGame = await this.userGameRepository.save(existing);
        return UserGameMapper.toDomainEntity(updatedUserGame);
      }

      const entity = this.userGameRepository.create(
        UserGameMapper.toPersistence(userGame),
      );
      const savedUserGame = await this.userGameRepository.save(entity);
      return UserGameMapper.toDomainEntity(savedUserGame);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new UserGameAlreadyExistsException(
          'この試合は既に観戦登録されています',
        );
      }
      throw error;
    }
  }

  async softDelete(userId: UserId, gameId: GameId): Promise<void> {
    await this.userGameRepository.softDelete({
      userId: userId.value,
      gameId: gameId.value,
    });
  }
}

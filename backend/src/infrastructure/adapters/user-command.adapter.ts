import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { UserCommandPort } from '../../domain/ports/user-command.port';
import { User } from '../../domain/entities/user';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { UserEntity } from '../typeorm/entities/user.entity';
import { UserRegistrationRequestEntity } from '../typeorm/entities/user-registration-request.entity';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class UserCommandAdapter implements UserCommandPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserRegistrationRequestEntity)
    private readonly registrationRequestRepository: Repository<UserRegistrationRequestEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async save(user: User): Promise<User> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const userEntity = this.userRepository.create(
          UserMapper.toPersistence(user),
        );
        await manager.save(UserEntity, userEntity);

        const registrationRequestEntity =
          this.registrationRequestRepository.create({
            id: randomUUID(),
            userId: user.id.value,
            status: UserMapper.toRegistrationStatusEnum(
              user.registrationStatus,
            ),
          });
        await manager.save(
          UserRegistrationRequestEntity,
          registrationRequestEntity,
        );
      });

      const savedUser = await this.userRepository.findOne({
        where: { id: user.id.value },
        relations: { registrationRequests: true },
        order: { registrationRequests: { createdAt: 'DESC' } },
      });

      if (!savedUser) {
        throw new Error(`User not found after save: ${user.id.value}`);
      }

      return UserMapper.toDomainEntity(savedUser);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new UserAlreadyExistsException(
          `User with email ${user.email.value} already exists`,
        );
      }
      throw error;
    }
  }

  async updateRegistrationStatus(user: User): Promise<User> {
    const registrationRequestEntity = this.registrationRequestRepository.create(
      {
        id: randomUUID(),
        userId: user.id.value,
        status: UserMapper.toRegistrationStatusEnum(user.registrationStatus),
      },
    );
    await this.registrationRequestRepository.save(registrationRequestEntity);

    return user;
  }
}

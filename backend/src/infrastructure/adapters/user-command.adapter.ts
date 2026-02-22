import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { randomUUID } from 'crypto';
import { UserCommandPort } from '../../domain/ports/user-command.port';
import { User } from '../../domain/entities/user';
import { UserId } from '../../domain/value-objects/user-id';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import {
  RegistrationStatus,
  RegistrationStatusType,
} from '../../domain/enums/registration-status';
import { UserRole, UserRoleType } from '../../domain/enums/user-role';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { UserEntity } from '../typeorm/entities/user.entity';
import { UserRegistrationRequestEntity } from '../typeorm/entities/user-registration-request.entity';
import { RegistrationStatusEnum } from '../typeorm/enums/registration-status.enum';
import { UserRoleEnum } from '../typeorm/enums/user-role.enum';

@Injectable()
export class UserCommandAdapter implements UserCommandPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserRegistrationRequestEntity)
    private readonly registrationRequestRepository: Repository<UserRegistrationRequestEntity>,
  ) {}

  async save(user: User): Promise<User> {
    try {
      const userEntity = this.userRepository.create(this.toPersistence(user));
      await this.userRepository.save(userEntity);

      const registrationRequestEntity =
        this.registrationRequestRepository.create({
          id: randomUUID(),
          userId: user.id.value,
          status: this.toRegistrationStatusEnum(user.registrationStatus),
        });
      await this.registrationRequestRepository.save(registrationRequestEntity);

      const savedUser = await this.userRepository.findOne({
        where: { id: user.id.value },
        relations: { registrationRequests: true },
        order: { registrationRequests: { createdAt: 'DESC' } },
      });

      if (!savedUser) {
        throw new Error(`User not found after save: ${user.id.value}`);
      }

      return this.toDomainEntity(savedUser);
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
        status: this.toRegistrationStatusEnum(user.registrationStatus),
      },
    );
    await this.registrationRequestRepository.save(registrationRequestEntity);

    return user;
  }

  private toDomainEntity(data: UserEntity): User {
    const latestStatus = data.registrationRequests[0]?.status;

    return User.fromRepository(
      UserId.create(data.id),
      Email.create(data.email),
      Password.fromHash(data.password),
      this.fromRegistrationStatusEnum(latestStatus),
      this.fromUserRoleEnum(data.role),
    );
  }

  private toPersistence(user: User): Partial<UserEntity> {
    return {
      id: user.id.value,
      email: user.email.value,
      password: user.password.hash,
      role: this.toUserRoleEnum(user.role),
    };
  }

  private toRegistrationStatusEnum(
    status: RegistrationStatusType,
  ): RegistrationStatusEnum {
    const map: Record<string, RegistrationStatusEnum> = {
      [RegistrationStatus.PENDING]: RegistrationStatusEnum.PENDING,
      [RegistrationStatus.APPROVED]: RegistrationStatusEnum.APPROVED,
      [RegistrationStatus.REJECTED]: RegistrationStatusEnum.REJECTED,
      [RegistrationStatus.BANNED]: RegistrationStatusEnum.BANNED,
    };
    const result = map[status];
    if (!result) {
      throw new Error(`Unknown RegistrationStatus: ${status}`);
    }
    return result;
  }

  private fromRegistrationStatusEnum(
    status: RegistrationStatusEnum,
  ): RegistrationStatusType {
    const map: Record<string, RegistrationStatusType> = {
      [RegistrationStatusEnum.PENDING]: RegistrationStatus.PENDING,
      [RegistrationStatusEnum.APPROVED]: RegistrationStatus.APPROVED,
      [RegistrationStatusEnum.REJECTED]: RegistrationStatus.REJECTED,
      [RegistrationStatusEnum.BANNED]: RegistrationStatus.BANNED,
    };
    return map[status];
  }

  private toUserRoleEnum(role: UserRoleType): UserRoleEnum {
    const map: Record<string, UserRoleEnum> = {
      [UserRole.USER]: UserRoleEnum.USER,
      [UserRole.ADMIN]: UserRoleEnum.ADMIN,
    };
    const result = map[role];
    if (!result) {
      throw new Error(`Unknown UserRole: ${role}`);
    }
    return result;
  }

  private fromUserRoleEnum(role: UserRoleEnum): UserRoleType {
    const map: Record<string, UserRoleType> = {
      [UserRoleEnum.USER]: UserRole.USER,
      [UserRoleEnum.ADMIN]: UserRole.ADMIN,
    };
    return map[role];
  }
}

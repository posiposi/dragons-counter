import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserQueryPort } from '../../domain/ports/user-query.port';
import { User } from '../../domain/entities/user';
import { UserId } from '../../domain/value-objects/user-id';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import {
  RegistrationStatus,
  RegistrationStatusType,
} from '../../domain/enums/registration-status';
import { UserRole, UserRoleType } from '../../domain/enums/user-role';
import { UserEntity } from '../typeorm/entities/user.entity';
import { RegistrationStatusEnum } from '../typeorm/enums/registration-status.enum';
import { UserRoleEnum } from '../typeorm/enums/user-role.enum';

@Injectable()
export class UserQueryAdapter implements UserQueryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: email.value },
      relations: { registrationRequests: true },
      order: { registrationRequests: { createdAt: 'DESC' } },
    });

    if (!user) {
      return null;
    }

    return this.toDomainEntity(user);
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: id.value },
      relations: { registrationRequests: true },
      order: { registrationRequests: { createdAt: 'DESC' } },
    });

    if (!user) {
      return null;
    }

    return this.toDomainEntity(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      relations: { registrationRequests: true },
      order: { registrationRequests: { createdAt: 'DESC' } },
    });

    return users.map((user) => this.toDomainEntity(user));
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

  private fromUserRoleEnum(role: UserRoleEnum): UserRoleType {
    const map: Record<string, UserRoleType> = {
      [UserRoleEnum.USER]: UserRole.USER,
      [UserRoleEnum.ADMIN]: UserRole.ADMIN,
    };
    return map[role];
  }
}

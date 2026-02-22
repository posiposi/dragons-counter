import { User } from '../../../domain/entities/user';
import { UserId } from '../../../domain/value-objects/user-id';
import { Email } from '../../../domain/value-objects/email';
import { Password } from '../../../domain/value-objects/password';
import {
  RegistrationStatus,
  RegistrationStatusType,
} from '../../../domain/enums/registration-status';
import { UserRole, UserRoleType } from '../../../domain/enums/user-role';
import { UserEntity } from '../../typeorm/entities/user.entity';
import { RegistrationStatusEnum } from '../../typeorm/enums/registration-status.enum';
import { UserRoleEnum } from '../../typeorm/enums/user-role.enum';

export class UserMapper {
  static toDomainEntity(data: UserEntity): User {
    if (!data.registrationRequests || data.registrationRequests.length === 0) {
      throw new Error(`User ${data.id} has no registration requests`);
    }
    const latestStatus = data.registrationRequests[0].status;

    return User.fromRepository(
      UserId.create(data.id),
      Email.create(data.email),
      Password.fromHash(data.password),
      UserMapper.fromRegistrationStatusEnum(latestStatus),
      UserMapper.fromUserRoleEnum(data.role),
    );
  }

  static toPersistence(user: User): Partial<UserEntity> {
    return {
      id: user.id.value,
      email: user.email.value,
      password: user.password.hash,
      role: UserMapper.toUserRoleEnum(user.role),
    };
  }

  static toRegistrationStatusEnum(
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

  static fromRegistrationStatusEnum(
    status: RegistrationStatusEnum,
  ): RegistrationStatusType {
    const map: Record<string, RegistrationStatusType> = {
      [RegistrationStatusEnum.PENDING]: RegistrationStatus.PENDING,
      [RegistrationStatusEnum.APPROVED]: RegistrationStatus.APPROVED,
      [RegistrationStatusEnum.REJECTED]: RegistrationStatus.REJECTED,
      [RegistrationStatusEnum.BANNED]: RegistrationStatus.BANNED,
    };
    const result = map[status];
    if (!result) {
      throw new Error(`Unknown RegistrationStatusEnum: ${status}`);
    }
    return result;
  }

  static toUserRoleEnum(role: UserRoleType): UserRoleEnum {
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

  static fromUserRoleEnum(role: UserRoleEnum): UserRoleType {
    const map: Record<string, UserRoleType> = {
      [UserRoleEnum.USER]: UserRole.USER,
      [UserRoleEnum.ADMIN]: UserRole.ADMIN,
    };
    const result = map[role];
    if (!result) {
      throw new Error(`Unknown UserRoleEnum: ${role}`);
    }
    return result;
  }
}

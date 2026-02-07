import { randomUUID } from 'crypto';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import {
  RegistrationStatus,
  RegistrationStatusType,
} from '../enums/registration-status';
import { UserRole, UserRoleType } from '../enums/user-role';
import { InvalidStatusTransitionException } from '../exceptions/invalid-status-transition.exception';

export class User {
  private readonly _id: UserId;
  private readonly _email: Email;
  private readonly _password: Password;
  private readonly _registrationStatus: RegistrationStatusType;
  private readonly _role: UserRoleType;

  private constructor(
    id: UserId,
    email: Email,
    password: Password,
    registrationStatus: RegistrationStatusType,
    role: UserRoleType = UserRole.USER,
  ) {
    this._id = id;
    this._email = email;
    this._password = password;
    this._registrationStatus = registrationStatus;
    this._role = role;
  }

  static createNew(email: Email, password: Password): User {
    const id = UserId.create(randomUUID());
    return new User(id, email, password, RegistrationStatus.PENDING);
  }

  static fromRepository(
    id: UserId,
    email: Email,
    password: Password,
    registrationStatus: RegistrationStatusType,
    role: UserRoleType = UserRole.USER,
  ): User {
    return new User(id, email, password, registrationStatus, role);
  }

  get id(): UserId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get password(): Password {
    return this._password;
  }

  get registrationStatus(): RegistrationStatusType {
    return this._registrationStatus;
  }

  get role(): UserRoleType {
    return this._role;
  }

  approve(): User {
    if (this._registrationStatus !== RegistrationStatus.PENDING) {
      throw new InvalidStatusTransitionException(
        `${this._registrationStatus}から${RegistrationStatus.APPROVED}への遷移はできません`,
      );
    }
    return new User(
      this._id,
      this._email,
      this._password,
      RegistrationStatus.APPROVED,
      this._role,
    );
  }

  reject(): User {
    if (this._registrationStatus !== RegistrationStatus.PENDING) {
      throw new InvalidStatusTransitionException(
        `${this._registrationStatus}から${RegistrationStatus.REJECTED}への遷移はできません`,
      );
    }
    return new User(
      this._id,
      this._email,
      this._password,
      RegistrationStatus.REJECTED,
      this._role,
    );
  }

  canLogin(): boolean {
    return this._registrationStatus === RegistrationStatus.APPROVED;
  }
}

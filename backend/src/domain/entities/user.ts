import { randomUUID } from 'crypto';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import {
  RegistrationStatus,
  RegistrationStatusType,
} from '../enums/registration-status';

export class User {
  private readonly _id: UserId;
  private readonly _email: Email;
  private readonly _password: Password;
  private readonly _registrationStatus: RegistrationStatusType;

  private constructor(
    id: UserId,
    email: Email,
    password: Password,
    registrationStatus: RegistrationStatusType,
  ) {
    this._id = id;
    this._email = email;
    this._password = password;
    this._registrationStatus = registrationStatus;
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
  ): User {
    return new User(id, email, password, registrationStatus);
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

  canLogin(): boolean {
    return this._registrationStatus === RegistrationStatus.APPROVED;
  }
}

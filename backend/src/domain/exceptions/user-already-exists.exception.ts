import { DomainException } from './domain-exception';

export class UserAlreadyExistsException extends DomainException {
  constructor(message: string) {
    super('USER_ALREADY_EXISTS', message);
  }
}

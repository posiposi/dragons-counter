import { DomainException } from './domain-exception';

export class UserGameAlreadyExistsException extends DomainException {
  constructor(message: string) {
    super('USER_GAME_ALREADY_EXISTS', message);
  }
}

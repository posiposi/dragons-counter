import { DomainException } from './domain-exception';

export class UserGameNotFoundException extends DomainException {
  constructor(message: string) {
    super('USER_GAME_NOT_FOUND', message);
  }
}

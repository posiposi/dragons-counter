import { DomainException } from './domain-exception';

export class GameNotFoundException extends DomainException {
  constructor(message: string) {
    super('GAME_NOT_FOUND', message);
  }
}

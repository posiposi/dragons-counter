import { DomainException } from './domain-exception';

export class InvalidStatusTransitionException extends DomainException {
  constructor(message: string) {
    super('INVALID_STATUS_TRANSITION', message);
  }
}

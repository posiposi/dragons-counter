import { DomainException } from './domain-exception';

export class UserNotApprovedException extends DomainException {
  constructor(message: string) {
    super('UNAUTHORIZED', message);
  }
}

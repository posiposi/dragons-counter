import { Injectable, Inject } from '@nestjs/common';
import type { UserCommandPort } from '../ports/user-command.port';
import type { UserQueryPort } from '../ports/user-query.port';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { User } from '../entities/user';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';

@Injectable()
export class SignupUsecase {
  constructor(
    @Inject('UserCommandPort')
    private readonly userCommandPort: UserCommandPort,
    @Inject('UserQueryPort')
    private readonly userQueryPort: UserQueryPort,
  ) {}

  async execute(email: string, password: string): Promise<void> {
    const emailVO = Email.create(email);

    const existingUser = await this.userQueryPort.findByEmail(emailVO);
    if (existingUser) {
      throw new UserAlreadyExistsException(
        'このメールアドレスは既に登録されています',
      );
    }

    const passwordVO = await Password.fromPlainText(password);
    const user = User.createNew(emailVO, passwordVO);

    await this.userCommandPort.save(user);
  }
}

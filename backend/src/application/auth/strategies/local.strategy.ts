import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../../../domain/entities/user';
import { Email } from '../../../domain/value-objects/email';
import type { UserQueryPort } from '../../../domain/ports/user-query.port';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('UserQueryPort')
    private readonly userQueryPort: UserQueryPort,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    const emailVO = Email.create(email);
    const user = await this.userQueryPort.findByEmail(emailVO);

    if (!user) {
      throw new UnauthorizedException(
        'メールアドレスまたはパスワードが正しくありません',
      );
    }

    const isPasswordValid = await user.password.compare(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'メールアドレスまたはパスワードが正しくありません',
      );
    }

    if (!user.canLogin()) {
      throw new UnauthorizedException(
        'このアカウントはログインが許可されていません',
      );
    }

    return user;
  }
}

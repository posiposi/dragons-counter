import { Injectable, Inject } from '@nestjs/common';
import type { TokenServicePort } from '../ports/token-service.port';
import { User } from '../entities/user';
import { UserNotApprovedException } from '../exceptions/user-not-approved.exception';

@Injectable()
export class SigninUsecase {
  constructor(
    @Inject('TokenServicePort')
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(user: User): Promise<{ accessToken: string }> {
    if (!user.canLogin()) {
      throw new UserNotApprovedException('User is not approved');
    }
    const payload = { sub: user.id.value, email: user.email.value };
    const accessToken = this.tokenService.sign(payload);
    return Promise.resolve({ accessToken });
  }
}

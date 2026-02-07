import { Injectable, Inject } from '@nestjs/common';
import type { TokenServicePort } from '../ports/token-service.port';
import { User } from '../entities/user';

@Injectable()
export class SigninUsecase {
  constructor(
    @Inject('TokenServicePort')
    private readonly tokenService: TokenServicePort,
  ) {}

  execute(user: User): Promise<{ accessToken: string }> {
    const payload = { sub: user.id.value, email: user.email.value };
    const accessToken = this.tokenService.sign(payload);
    return Promise.resolve({ accessToken });
  }
}

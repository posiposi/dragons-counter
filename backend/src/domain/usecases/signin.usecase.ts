import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user';

@Injectable()
export class SigninUsecase {
  constructor(private readonly jwtService: JwtService) {}

  async execute(user: User): Promise<{ accessToken: string }> {
    const payload = { sub: user.id.value, email: user.email.value };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TokenServicePort } from '../../../domain/ports/token-service.port';

@Injectable()
export class JwtTokenServiceAdapter implements TokenServicePort {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: { sub: string; email: string }): string {
    return this.jwtService.sign(payload);
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TokenServicePort } from '../../../domain/ports/token-service.port';

@Injectable()
export class JwtTokenServiceAdapter implements TokenServicePort {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: { sub: string; email: string; role: string }): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): { sub: string; email: string; role: string } {
    const decoded = this.jwtService.verify<{
      sub: string;
      email: string;
      role: string;
    }>(token);
    return { sub: decoded.sub, email: decoded.email, role: decoded.role };
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.accessToken ?? null;
      },
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ userId: string; email: string }> {
    return await Promise.resolve({
      userId: payload.sub,
      email: payload.email,
    });
  }
}

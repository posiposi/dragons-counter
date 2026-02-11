import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfValidationGuard implements CanActivate {
  private readonly SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (this.SAFE_METHODS.includes(request.method)) {
      return true;
    }

    const cookieToken = request.cookies?.['csrf-token'];
    const headerToken = request.headers['x-csrf-token'];

    if (!cookieToken || !headerToken) {
      throw new ForbiddenException('CSRF token missing');
    }

    if (cookieToken !== headerToken) {
      throw new ForbiddenException('CSRF token mismatch');
    }

    return true;
  }
}

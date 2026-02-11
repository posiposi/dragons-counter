import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../../domain/enums/user-role';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: { role?: string };
    }>();
    const user = request.user;

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('管理者権限が必要です');
    }

    return true;
  }
}

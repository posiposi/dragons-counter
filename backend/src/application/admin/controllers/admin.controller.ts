import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { GetUsersUsecase } from '../../../domain/usecases/get-users.usecase';
import { GetCurrentUserUsecase } from '../../../domain/usecases/get-current-user.usecase';
import { ApproveUserUsecase } from '../../../domain/usecases/approve-user.usecase';
import { RejectUserUsecase } from '../../../domain/usecases/reject-user.usecase';
import { UserResponseDto } from '../../auth/dto/user-response.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class GetUsersController {
  constructor(private readonly getUsersUsecase: GetUsersUsecase) {}

  @Get('users')
  async getUsers(): Promise<UserResponseDto[]> {
    return this.getUsersUsecase.execute();
  }
}

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class GetUserController {
  constructor(
    private readonly getCurrentUserUsecase: GetCurrentUserUsecase,
  ) {}

  @Get('users/:id')
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.getCurrentUserUsecase.execute(id);
  }
}

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ApproveUserController {
  constructor(private readonly approveUserUsecase: ApproveUserUsecase) {}

  @Patch('users/:id/approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  async approveUser(@Param('id') id: string): Promise<void> {
    await this.approveUserUsecase.execute(id);
  }
}

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class RejectUserController {
  constructor(private readonly rejectUserUsecase: RejectUserUsecase) {}

  @Patch('users/:id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectUser(@Param('id') id: string): Promise<void> {
    await this.rejectUserUsecase.execute(id);
  }
}

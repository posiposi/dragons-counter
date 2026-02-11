import { Module } from '@nestjs/common';
import {
  GetUsersController,
  GetUserController,
  ApproveUserController,
  RejectUserController,
} from './controllers/admin.controller';
import { GetUsersUsecase } from '../../domain/usecases/get-users.usecase';
import { GetCurrentUserUsecase } from '../../domain/usecases/get-current-user.usecase';
import { ApproveUserUsecase } from '../../domain/usecases/approve-user.usecase';
import { RejectUserUsecase } from '../../domain/usecases/reject-user.usecase';
import { UserQueryAdapter } from '../../infrastructure/adapters/user-query.adapter';
import { UserCommandAdapter } from '../../infrastructure/adapters/user-command.adapter';

@Module({
  controllers: [
    GetUsersController,
    GetUserController,
    ApproveUserController,
    RejectUserController,
  ],
  providers: [
    GetUsersUsecase,
    GetCurrentUserUsecase,
    ApproveUserUsecase,
    RejectUserUsecase,
    {
      provide: 'UserQueryPort',
      useClass: UserQueryAdapter,
    },
    {
      provide: 'UserCommandPort',
      useClass: UserCommandAdapter,
    },
  ],
})
export class AdminModule {}

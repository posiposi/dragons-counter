import { Module } from '@nestjs/common';
import { SignupController } from './controllers/signup.controller';
import { SignupUsecase } from '../../domain/usecases/signup.usecase';
import { UserCommandAdapter } from '../../infrastructure/adapters/user-command.adapter';
import { UserQueryAdapter } from '../../infrastructure/adapters/user-query.adapter';

@Module({
  controllers: [SignupController],
  providers: [
    SignupUsecase,
    {
      provide: 'UserCommandPort',
      useClass: UserCommandAdapter,
    },
    {
      provide: 'UserQueryPort',
      useClass: UserQueryAdapter,
    },
  ],
})
export class AuthModule {}

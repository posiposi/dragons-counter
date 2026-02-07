import { Module } from '@nestjs/common';
import { SignupController } from './controllers/signup.controller';
import { SignupUsecase } from '../../domain/usecases/signup.usecase';
import { UserCommandAdapter } from '../../infrastructure/adapters/user-command.adapter';
import { UserQueryAdapter } from '../../infrastructure/adapters/user-query.adapter';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

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
    PrismaService,
    {
      provide: PrismaClient,
      useExisting: PrismaService,
    },
  ],
})
export class AuthModule {}

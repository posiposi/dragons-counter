import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SignupController } from './controllers/signup.controller';
import { SigninController } from './controllers/signin.controller';
import { SignoutController } from './controllers/signout.controller';
import { MeController } from './controllers/me.controller';
import { SignupUsecase } from '../../domain/usecases/signup.usecase';
import { SigninUsecase } from '../../domain/usecases/signin.usecase';
import { GetCurrentUserUsecase } from '../../domain/usecases/get-current-user.usecase';
import { UserCommandAdapter } from '../../infrastructure/adapters/user-command.adapter';
import { UserQueryAdapter } from '../../infrastructure/adapters/user-query.adapter';
import { JwtTokenServiceAdapter } from '../../infrastructure/adapters/services/jwt-token-service.adapter';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    SignupController,
    SigninController,
    SignoutController,
    MeController,
  ],
  providers: [
    SignupUsecase,
    SigninUsecase,
    GetCurrentUserUsecase,
    LocalStrategy,
    JwtStrategy,
    {
      provide: 'UserCommandPort',
      useClass: UserCommandAdapter,
    },
    {
      provide: 'UserQueryPort',
      useClass: UserQueryAdapter,
    },
    {
      provide: 'TokenServicePort',
      useClass: JwtTokenServiceAdapter,
    },
  ],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGameEntity } from '../infrastructure/typeorm/entities/user-game.entity';
import { UserGameCommandAdapter } from '../infrastructure/adapters/user-game-command.adapter';
import { UserGameQueryAdapter } from '../infrastructure/adapters/user-game-query.adapter';
import { GameModule } from './game.module';
import { RegisterUserGameUsecase } from '../domain/usecases/register-user-game.usecase';
import { GetUserGamesUsecase } from '../domain/usecases/get-user-games.usecase';
import { DeleteUserGameUsecase } from '../domain/usecases/delete-user-game.usecase';
import { RegisterUserGameController } from './controllers/register-user-game.controller';
import { GetUserGamesController } from './controllers/get-user-games.controller';
import { DeleteUserGameController } from './controllers/delete-user-game.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserGameEntity]), GameModule],
  controllers: [
    RegisterUserGameController,
    GetUserGamesController,
    DeleteUserGameController,
  ],
  providers: [
    RegisterUserGameUsecase,
    GetUserGamesUsecase,
    DeleteUserGameUsecase,
    {
      provide: 'UserGameCommandPort',
      useClass: UserGameCommandAdapter,
    },
    {
      provide: 'UserGameQueryPort',
      useClass: UserGameQueryAdapter,
    },
  ],
  exports: ['UserGameCommandPort', 'UserGameQueryPort'],
})
export class UserGameModule {}

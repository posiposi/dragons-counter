import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGameEntity } from '../infrastructure/typeorm/entities/user-game.entity';
import { UserGameCommandAdapter } from '../infrastructure/adapters/user-game-command.adapter';
import { UserGameQueryAdapter } from '../infrastructure/adapters/user-game-query.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([UserGameEntity])],
  providers: [
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

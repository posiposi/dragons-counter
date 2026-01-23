import { Module } from '@nestjs/common';
import { GetGamesController } from './controllers/get-games.controller';
import { DeleteGameController } from './controllers/delete-game.controller';
import { GetGamesUsecase } from '../domain/usecases/get-games.usecase';
import { DeleteGameUsecase } from '../domain/usecases/delete-game.usecase';
import { GameAdapter } from '../infrastructure/adapters/game.adapter';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [GetGamesController, DeleteGameController],
  providers: [
    GetGamesUsecase,
    DeleteGameUsecase,
    {
      provide: 'GamePort',
      useClass: GameAdapter,
    },
    PrismaService,
    {
      provide: PrismaClient,
      useExisting: PrismaService,
    },
  ],
})
export class GameModule {}

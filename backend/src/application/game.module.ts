import { Module } from '@nestjs/common';
import { CreateGameController } from './controllers/create-game.controller';
import { GetGamesController } from './controllers/get-games.controller';
import { DeleteGameController } from './controllers/delete-game.controller';
import { CreateGameUseCase } from '../domain/usecases/create-game.usecase';
import { GetGamesUsecase } from '../domain/usecases/get-games.usecase';
import { DeleteGameUsecase } from '../domain/usecases/delete-game.usecase';
import { GameAdapter } from '../infrastructure/adapters/game.adapter';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [CreateGameController, GetGamesController, DeleteGameController],
  providers: [
    CreateGameUseCase,
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

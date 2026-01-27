import { Module } from '@nestjs/common';
import { GetGamesController } from './controllers/get-games.controller';
import { DeleteGameController } from './controllers/delete-game.controller';
import { BulkCreateGameController } from './controllers/bulk-create-game.controller';
import { GetGamesUsecase } from '../domain/usecases/get-games.usecase';
import { DeleteGameUsecase } from '../domain/usecases/delete-game.usecase';
import { BulkCreateGameUsecase } from '../domain/usecases/bulk-create-game.usecase';
import { GameAdapter } from '../infrastructure/adapters/game.adapter';
import { BulkCreateGameAdapter } from '../infrastructure/adapters/bulk-create-game.adapter';
import { FindGameByDateAdapter } from '../infrastructure/adapters/find-game-by-date.adapter';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [
    GetGamesController,
    DeleteGameController,
    BulkCreateGameController,
  ],
  providers: [
    GetGamesUsecase,
    DeleteGameUsecase,
    BulkCreateGameUsecase,
    {
      provide: 'GamePort',
      useClass: GameAdapter,
    },
    {
      provide: 'BulkCreateGamePort',
      useClass: BulkCreateGameAdapter,
    },
    {
      provide: 'FindGameByDatePort',
      useClass: FindGameByDateAdapter,
    },
    PrismaService,
    {
      provide: PrismaClient,
      useExisting: PrismaService,
    },
  ],
})
export class GameModule {}

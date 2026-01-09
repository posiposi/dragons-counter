import { Module } from '@nestjs/common';
import { GetStadiumsUsecase } from '../domain/usecases/get-stadiums.usecase';
import { GetDefaultStadiumUsecase } from '../domain/usecases/get-default-stadium.usecase';
import { StadiumAdapter } from '../infrastructure/adapters/stadium.adapter';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [],
  providers: [
    GetStadiumsUsecase,
    GetDefaultStadiumUsecase,
    {
      provide: 'StadiumPort',
      useClass: StadiumAdapter,
    },
    PrismaService,
    {
      provide: PrismaClient,
      useExisting: PrismaService,
    },
  ],
})
export class StadiumModule {}

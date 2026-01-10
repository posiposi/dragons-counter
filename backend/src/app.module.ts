import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './application/game.module';
import { StadiumModule } from './application/stadium.module';

@Module({
  imports: [GameModule, StadiumModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

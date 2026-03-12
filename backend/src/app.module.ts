import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './application/game.module';
import { AuthModule } from './application/auth/auth.module';
import { AdminModule } from './application/admin/admin.module';
import { ScrapingModule } from './application/scraping.module';
import { UserGameModule } from './application/user-game.module';
import { TypeormModule } from './infrastructure/typeorm/typeorm.module';

@Module({
  imports: [
    TypeormModule,
    GameModule,
    AuthModule,
    AdminModule,
    ScrapingModule,
    UserGameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

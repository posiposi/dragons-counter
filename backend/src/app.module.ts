import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './application/game.module';
import { AuthModule } from './application/auth/auth.module';
import { AdminModule } from './application/admin/admin.module';
import { ScrapingModule } from './application/scraping.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule, GameModule, AuthModule, AdminModule, ScrapingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

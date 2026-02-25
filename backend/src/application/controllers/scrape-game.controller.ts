import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ScrapeGameUsecase } from '../../domain/usecases/scrape-game.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';
import { ScrapeGameRequestDto } from '../dto/request/scrape-game-request.dto';
import type { ScrapeResult } from '../../domain/ports/scraping.port';

@Controller('scrape')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ScrapeGameController {
  constructor(private readonly scrapeGameUsecase: ScrapeGameUsecase) {}

  @Post()
  async scrape(@Body() body: ScrapeGameRequestDto): Promise<ScrapeResult> {
    return await this.scrapeGameUsecase.execute(body.date);
  }
}

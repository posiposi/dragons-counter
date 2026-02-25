import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import {
  BulkCreateGameUsecase,
  BulkCreateGameResult,
} from '../../domain/usecases/bulk-create-game.usecase';
import { BulkCreateGameDto } from '../dto/request/bulk-create-game.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('games')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BulkCreateGameController {
  constructor(private readonly bulkCreateGameUsecase: BulkCreateGameUsecase) {}

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkCreate(
    @Body() dto: BulkCreateGameDto,
  ): Promise<BulkCreateGameResult> {
    try {
      return await this.bulkCreateGameUsecase.execute(dto.games);
    } catch {
      throw new InternalServerErrorException('Failed to bulk create games');
    }
  }
}

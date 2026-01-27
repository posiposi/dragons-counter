/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  BulkCreateGameUsecase,
  BulkCreateGameResult,
} from '../../domain/usecases/bulk-create-game.usecase';
import { BulkCreateGameDto } from '../dto/request/bulk-create-game.dto';

@Controller('games')
export class BulkCreateGameController {
  constructor(private readonly bulkCreateGameUsecase: BulkCreateGameUsecase) {}

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkCreate(
    @Body() dto: BulkCreateGameDto,
  ): Promise<BulkCreateGameResult> {
    try {
      return await this.bulkCreateGameUsecase.execute(dto.games);
    } catch (error) {
      throw new InternalServerErrorException('Failed to bulk create games');
    }
  }
}

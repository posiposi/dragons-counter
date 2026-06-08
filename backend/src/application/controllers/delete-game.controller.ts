import {
  Controller,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DeleteGameUsecase } from '../../domain/usecases/delete-game.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('games')
@UseGuards(JwtAuthGuard, AdminGuard)
export class DeleteGameController {
  constructor(private readonly deleteGameUsecase: DeleteGameUsecase) {}

  @Delete(':gameId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGame(@Param('gameId') gameId: string): Promise<void> {
    await this.deleteGameUsecase.execute(gameId);
  }
}

import {
  Controller,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DeleteGameUsecase } from '../../domain/usecases/delete-game.usecase';

@Controller('games')
export class DeleteGameController {
  constructor(private readonly deleteGameUsecase: DeleteGameUsecase) {}

  @Delete(':gameId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGame(@Param('gameId') gameId: string): Promise<void> {
    await this.deleteGameUsecase.execute(gameId);
  }
}

import {
  Controller,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DeleteUserGameUsecase } from '../../domain/usecases/delete-user-game.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user-games')
@UseGuards(JwtAuthGuard)
export class DeleteUserGameController {
  constructor(private readonly deleteUserGameUsecase: DeleteUserGameUsecase) {}

  @Delete(':gameId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserGame(
    @Request() req: { user: { userId: string; email: string } },
    @Param('gameId') gameId: string,
  ): Promise<void> {
    await this.deleteUserGameUsecase.execute(req.user.userId, gameId);
  }
}

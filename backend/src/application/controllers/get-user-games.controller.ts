import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GetUserGamesUsecase } from '../../domain/usecases/get-user-games.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserGameResponseDto } from '../dto/response/user-game-response.dto';

@Controller('user-games')
@UseGuards(JwtAuthGuard)
export class GetUserGamesController {
  constructor(private readonly getUserGamesUsecase: GetUserGamesUsecase) {}

  @Get()
  async getUserGames(
    @Request() req: { user: { userId: string; email: string } },
  ): Promise<UserGameResponseDto[]> {
    return await this.getUserGamesUsecase.execute(req.user.userId);
  }
}

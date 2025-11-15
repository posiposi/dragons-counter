import { Controller, Get } from '@nestjs/common';
import { GetGamesUsecase } from '../../domain/usecases/get-games.usecase';
import { GameResponseDto } from '../dto/response/game-response.dto';

@Controller('games')
export class GetGamesController {
  constructor(private readonly getGamesUsecase: GetGamesUsecase) {}

  @Get()
  async getGames(): Promise<GameResponseDto[]> {
    return await this.getGamesUsecase.execute();
  }
}

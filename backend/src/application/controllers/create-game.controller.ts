import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateGameUseCase } from '../../domain/usecases/create-game.usecase';
import { CreateGameRequest } from '../dto/request/create-game.dto';
import { GameResponseDto } from '../dto/response/game-response.dto';

@Controller('games')
export class CreateGameController {
  constructor(private readonly createGameUseCase: CreateGameUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateGameRequest): Promise<GameResponseDto> {
    const game = await this.createGameUseCase.execute({
      gameDate: dto.gameDate,
      opponent: dto.opponent,
      dragonsScore: dto.dragonsScore,
      opponentScore: dto.opponentScore,
      stadium: dto.stadium,
      notes: dto.notes,
    });

    return {
      id: game.id.value,
      gameDate: game.gameDate.value.toISOString().split('T')[0],
      opponent: game.opponent.value,
      dragonsScore: game.dragonsScore.value,
      opponentScore: game.opponentScore.value,
      result: game.result.value,
      stadium: game.stadium.value,
      notes: game.notes?.value || null,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
    };
  }
}

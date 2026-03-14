import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RegisterUserGameUsecase } from '../../domain/usecases/register-user-game.usecase';
import { RegisterUserGameRequestDto } from '../dto/request/register-user-game-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user-games')
@UseGuards(JwtAuthGuard)
export class RegisterUserGameController {
  constructor(
    private readonly registerUserGameUsecase: RegisterUserGameUsecase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Request() req: { user: { userId: string; email: string } },
    @Body() dto: RegisterUserGameRequestDto,
  ): Promise<void> {
    await this.registerUserGameUsecase.execute(req.user.userId, dto.gameId);
  }
}

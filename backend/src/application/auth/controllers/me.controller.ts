import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GetCurrentUserUsecase } from '../../../domain/usecases/get-current-user.usecase';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller('auth')
export class MeController {
  constructor(private readonly getCurrentUserUsecase: GetCurrentUserUsecase) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(
    @Request() req: { user: { userId: string; email: string } },
  ): Promise<UserResponseDto> {
    return this.getCurrentUserUsecase.execute(req.user.userId);
  }
}

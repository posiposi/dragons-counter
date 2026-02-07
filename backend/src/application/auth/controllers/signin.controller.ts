import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SigninUsecase } from '../../../domain/usecases/signin.usecase';
import { SigninRequestDto } from '../dto/signin-request.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { User } from '../../../domain/entities/user';

@Controller('auth')
export class SigninController {
  constructor(private readonly signinUsecase: SigninUsecase) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async signin(
    @Body() dto: SigninRequestDto,
    @Request() req: { user: User },
  ): Promise<{ accessToken: string }> {
    return this.signinUsecase.execute(req.user);
  }
}

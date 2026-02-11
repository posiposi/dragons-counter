import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { randomUUID } from 'crypto';
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
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { accessToken } = await this.signinUsecase.execute(req.user);
    const csrfToken = randomUUID();

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api',
    });

    res.cookie('csrf-token', csrfToken, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  }
}

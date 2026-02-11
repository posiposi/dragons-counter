import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class SignoutController {
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  signout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api',
    });

    res.clearCookie('csrf-token', {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  }
}

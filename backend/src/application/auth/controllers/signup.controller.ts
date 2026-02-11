import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SignupUsecase } from '../../../domain/usecases/signup.usecase';
import { SignupRequestDto } from '../dto/signup-request.dto';
import { SkipCsrf } from '../decorators/skip-csrf.decorator';

@Controller('auth')
export class SignupController {
  constructor(private readonly signupUsecase: SignupUsecase) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @SkipCsrf()
  async signup(@Body() dto: SignupRequestDto): Promise<void> {
    await this.signupUsecase.execute(dto.email, dto.password);
  }
}

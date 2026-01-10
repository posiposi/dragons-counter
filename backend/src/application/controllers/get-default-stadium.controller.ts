import { Controller, Get } from '@nestjs/common';
import { GetDefaultStadiumUsecase } from '../../domain/usecases/get-default-stadium.usecase';
import { StadiumResponseDto } from '../dto/response/stadium-response.dto';

@Controller('stadiums')
export class GetDefaultStadiumController {
  constructor(
    private readonly getDefaultStadiumUsecase: GetDefaultStadiumUsecase,
  ) {}

  @Get('default')
  async getDefaultStadium(): Promise<StadiumResponseDto> {
    return await this.getDefaultStadiumUsecase.execute();
  }
}

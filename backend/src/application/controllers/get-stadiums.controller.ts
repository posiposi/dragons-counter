import { Controller, Get } from '@nestjs/common';
import { GetStadiumsUsecase } from '../../domain/usecases/get-stadiums.usecase';
import { StadiumResponseDto } from '../dto/response/stadium-response.dto';

@Controller('stadiums')
export class GetStadiumsController {
  constructor(private readonly getStadiumsUsecase: GetStadiumsUsecase) {}

  @Get()
  async getStadiums(): Promise<StadiumResponseDto[]> {
    return await this.getStadiumsUsecase.execute();
  }
}

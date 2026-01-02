import { Injectable, Inject } from '@nestjs/common';
import type { StadiumPort } from '../ports/stadium.port';
import { StadiumResponseDto } from '../../application/dto/response/stadium-response.dto';

@Injectable()
export class GetStadiumsUsecase {
  constructor(
    @Inject('StadiumPort') private readonly stadiumPort: StadiumPort,
  ) {}

  async execute(): Promise<StadiumResponseDto[]> {
    const stadiums = await this.stadiumPort.findAll();
    return stadiums.map((stadium) => new StadiumResponseDto(stadium));
  }
}

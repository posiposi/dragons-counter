import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { StadiumPort } from '../ports/stadium.port';
import { StadiumResponseDto } from '../../application/dto/response/stadium-response.dto';

@Injectable()
export class GetDefaultStadiumUsecase {
  constructor(
    @Inject('StadiumPort') private readonly stadiumPort: StadiumPort,
  ) {}

  async execute(): Promise<StadiumResponseDto> {
    const stadium = await this.stadiumPort.findDefault();
    if (!stadium) {
      throw new NotFoundException('Default stadium not found');
    }
    return new StadiumResponseDto(stadium);
  }
}

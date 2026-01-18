import { Injectable } from '@nestjs/common';
import { StadiumPort } from '../../domain/ports/stadium.port';
import { PrismaClient, Stadium as PrismaStadium } from '@prisma/client';
import { Stadium } from '../../domain/entities/stadium';
import { StadiumId } from '../../domain/value-objects/stadium-id';
import { StadiumName } from '../../domain/value-objects/stadium-name';

@Injectable()
export class StadiumAdapter implements StadiumPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Stadium[]> {
    const stadiums = await this.prisma.stadium.findMany();

    return stadiums.map((stadium) => this.toDomainEntity(stadium));
  }

  async findDefault(): Promise<Stadium | null> {
    const stadium = await this.prisma.stadium.findFirst({
      where: {
        isDefault: true,
      },
    });

    if (!stadium) {
      return null;
    }

    return this.toDomainEntity(stadium);
  }

  private toDomainEntity(data: PrismaStadium): Stadium {
    return Stadium.create(
      new StadiumId(data.id),
      new StadiumName(data.name),
      data.isDefault,
      data.createdAt,
      data.updatedAt,
    );
  }
}

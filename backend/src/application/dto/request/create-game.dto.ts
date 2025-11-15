import {
  IsString,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGameRequest {
  @IsDateString()
  gameDate: string;

  @IsString()
  opponent: string;

  @IsInt()
  @Min(0)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  dragonsScore: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  opponentScore: number;

  @IsString()
  stadium: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

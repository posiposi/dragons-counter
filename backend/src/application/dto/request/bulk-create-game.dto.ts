import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GameInputDto {
  @IsDateString()
  @IsNotEmpty()
  gameDate: string;

  @IsString()
  @IsNotEmpty()
  opponent: string;

  @IsInt()
  @Min(0)
  dragonsScore: number;

  @IsInt()
  @Min(0)
  opponentScore: number;

  @IsString()
  @IsNotEmpty()
  stadium: string;
}

export class BulkCreateGameDto {
  @IsString()
  @IsNotEmpty()
  stadiumId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GameInputDto)
  games: GameInputDto[];
}

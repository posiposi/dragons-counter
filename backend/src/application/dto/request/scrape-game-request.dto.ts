import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ScrapeGameRequestDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateはYYYY-MM-DD形式で指定してください',
  })
  date: string;
}

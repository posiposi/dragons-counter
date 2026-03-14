import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterUserGameRequestDto {
  @IsNotEmpty()
  @IsString()
  gameId: string;
}

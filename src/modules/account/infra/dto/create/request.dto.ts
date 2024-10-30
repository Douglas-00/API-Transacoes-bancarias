import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAccountRequestDto {
  @IsNotEmpty()
  @IsString()
  number: string;

  @IsNotEmpty()
  @IsNumber()
  balance: number;
}

import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateAccountRequestDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsOptional()
  @IsNumber()
  balance?: number;
}

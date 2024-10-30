import { IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionRequestDto {
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  accountId: number;

  @IsOptional()
  @IsNumber()
  destinoId?: number;
}

import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
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
}

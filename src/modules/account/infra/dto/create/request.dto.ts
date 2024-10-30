import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';

// DTO para criação de contas
export class CreateAccountRequestDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsNumber()
  balance: number;
}

export class CreateTransactionRequestDto {
  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  accountId: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  destinyId?: number;
}

export class CreateAccountsRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAccountRequestDto)
  accounts: CreateAccountRequestDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionRequestDto)
  transactions: CreateTransactionRequestDto[];
}

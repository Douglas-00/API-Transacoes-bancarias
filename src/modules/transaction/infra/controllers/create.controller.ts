import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TRANSACTION_RESOURCE } from './route';
import { CreateTransactionRequestDto } from '../dto/create/request.dto';
import { CreateTransactionResponseDto } from '../dto/create/response.dto';
import { CreateTransactionUseCase } from '../../useCases/create.useCase';

@Controller(TRANSACTION_RESOURCE)
export class CreateTransactionController {
  constructor(private readonly useCase: CreateTransactionUseCase) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTransaction(
    @Body() payload: CreateTransactionRequestDto,
  ): Promise<CreateTransactionResponseDto> {
    return await this.useCase.execute(payload);
  }
}

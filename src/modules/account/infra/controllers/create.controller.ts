import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateAccountsRequestDto } from '../dto/create/request.dto';
import { CreateAccountResponseDto } from '../dto/create/response.dto';
import { ACCOUNT_RESOURCE } from './route';
import { CreateAccountUseCase } from '../../useCases/create.useCase';

@Controller(ACCOUNT_RESOURCE)
export class CreateAccountController {
  constructor(private readonly useCase: CreateAccountUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAccount(
    @Body() payload: CreateAccountsRequestDto,
  ): Promise<CreateAccountResponseDto> {
    console.log(payload);
    return await this.useCase.execute(payload);
  }
}

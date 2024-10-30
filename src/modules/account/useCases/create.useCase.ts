import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateAccountRequestDto } from '../infra/dto/create/request.dto';
import { CreateAccountResponseDto } from '../infra/dto/create/response.dto';
import { AppLogger } from 'src/modules/logger/logger.service';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  async execute(
    payload: CreateAccountRequestDto,
  ): Promise<CreateAccountResponseDto> {
    const number = payload.number;
    const balance = payload.balance;

    this.logger.debug(`Iniciando criação de conta para: ${number}`);

    const existingAccount = await this.prisma.account.findUnique({
      where: { number: number },
    });

    if (existingAccount) {
      this.logger.warn(`Conta com número ${number} já existe`);
      throw new ConflictException('Account with this number already exists');
    }

    try {
      const account = await this.prisma.account.create({
        data: {
          number: number,
          balance: balance,
        },
      });

      this.logger.log(`Conta criada com ID: ${account.id}`);

      return {
        message: 'Account created successfully!',
      };
    } catch (error) {
      this.logger.error(`Erro ao criar conta: ${error.message}`);
      throw error;
    }
  }
}

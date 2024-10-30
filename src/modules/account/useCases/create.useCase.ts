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
    payload: CreateAccountRequestDto[],
  ): Promise<CreateAccountResponseDto> {
    const accountNumbers = payload.map((account) => account.number);

    const existingAccounts = await this.prisma.account.findMany({
      where: {
        number: {
          in: accountNumbers,
        },
      },
    });

    if (existingAccounts.length > 0) {
      const existingNumbers = existingAccounts
        .map((account) => account.number)
        .join(', ');
      this.logger.warn(`Contas com números ${existingNumbers} já existem`);
      throw new ConflictException(
        `Accounts with numbers ${existingNumbers} already exist`,
      );
    }

    try {
      const result = await this.prisma.account.createMany({
        data: payload,
      });

      this.logger.log(`Contas: ${result.count} criadas com sucesso`);

      return {
        message: 'Accounts created successfully!',
      };
    } catch (error) {
      this.logger.error(`Erro ao criar conta: ${error.message}`);
      throw error;
    }
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateTransactionRequestDto } from '../infra/dto/create/request.dto';
import { CreateTransactionResponseDto } from '../infra/dto/create/response.dto';
import { Account } from '@prisma/client';

@Injectable()
export class CreateTransactionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    payload: CreateTransactionRequestDto,
  ): Promise<CreateTransactionResponseDto> {
    // Iniciar a transação com o Prisma
    return this.prisma.$transaction(async (prisma) => {
      // Realizar o bloqueio de nível de linha na conta usando SQL bruto
      const [account] = await prisma.$queryRaw<Account[]>`
        SELECT * FROM Account WHERE id = ${payload.accountId} FOR UPDATE;
      `;

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // Verificar saldo para saques e transferências
      if (
        (payload.type === 'WITHDRAW' || payload.type === 'TRANSFER') &&
        account.balance < payload.amount
      ) {
        throw new ConflictException('Insufficient balance');
      }

      // Atualizar saldo e criar a transação dentro da mesma transação
      if (payload.type === 'DEPOSIT') {
        await prisma.account.update({
          where: { id: payload.accountId },
          data: { balance: { increment: payload.amount } },
        });
      } else if (payload.type === 'WITHDRAW') {
        await prisma.account.update({
          where: { id: payload.accountId },
          data: { balance: { decrement: payload.amount } },
        });
      }

      // Criar a transação no banco de dados
      await prisma.transaction.create({
        data: {
          type: payload.type,
          amount: payload.amount,
          accountId: payload.accountId,
          status: 'COMPLETED',
        },
      });

      return {
        message: 'Transaction processed successfully!',
      };
    });
  }
}

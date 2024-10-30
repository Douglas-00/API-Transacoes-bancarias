import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateTransactionRequestDto } from '../infra/dto/create/request.dto';
import { CreateTransactionResponseDto } from '../infra/dto/create/response.dto';
import {
  Account,
  TransactionStatus,
  TransactionType,
  AccountRole,
} from '@prisma/client';
import { AppLogger } from 'src/modules/logger/logger.service';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  async execute(
    payload: CreateTransactionRequestDto,
  ): Promise<CreateTransactionResponseDto> {
    return this.prisma.$transaction(async (prisma) => {
      const accountId = payload.accountId;
      const type = payload.type;
      const value = payload.amount;
      const destinoId = payload.destinoId || null;

      this.logger.debug(`Iniciando Transação para a conta ${accountId}`);

      const [account] = await prisma.$queryRaw<Account[]>`
        SELECT * FROM Account WHERE id = ${accountId} FOR UPDATE;
      `;

      if (!account) {
        this.logger.warn(`Conta com número ${accountId} não encontrada`);
        throw new NotFoundException('Account not found');
      }

      switch (type) {
        case TransactionType.DEPOSIT:
          await this.deposit(accountId, value);
          break;

        case TransactionType.WITHDRAW:
          await this.withdraw(account, value);
          break;

        case TransactionType.TRANSFER:
          if (!destinoId) {
            this.logger.warn('DestinoId é obrigatório para transferências');
            throw new ConflictException(
              'Destination account ID is required for transfer',
            );
          }
          await this.transfer(account, destinoId, value);
          break;

        default:
          throw new ConflictException('Invalid transaction type');
      }

      this.logger.log('Transação concluída com sucesso!');

      return {
        message: 'Transaction processed successfully!',
      };
    });
  }

  private async deposit(accountId: number, amount: number) {
    await this.prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: amount } },
    });

    await this.prisma.transaction.create({
      data: {
        type: TransactionType.DEPOSIT,
        amount: amount,
        status: TransactionStatus.COMPLETED,
        accounts: {
          create: {
            accountId: accountId,
            role: AccountRole.ORIGIN,
          },
        },
      },
    });

    this.logger.debug(
      `Depósito de ${amount} concluído para a conta ${accountId}`,
    );
  }

  private async withdraw(account: Account, amount: number) {
    if (account.balance < amount) {
      this.logger.warn(`Saldo insuficiente na conta ${account.id}`);
      throw new ConflictException('Insufficient balance');
    }

    await this.prisma.account.update({
      where: { id: account.id },
      data: { balance: { decrement: amount } },
    });

    await this.prisma.transaction.create({
      data: {
        type: TransactionType.WITHDRAW,
        amount: amount,
        status: TransactionStatus.COMPLETED,
        accounts: {
          create: {
            accountId: account.id,
            role: AccountRole.ORIGIN,
          },
        },
      },
    });

    this.logger.debug(`Saque de ${amount} concluído na conta ${account.id}`);
  }

  private async transfer(origem: Account, destinoId: number, amount: number) {
    // Busca e bloqueia a conta de destino
    const [destino] = await this.prisma.$queryRaw<Account[]>`
      SELECT * FROM Account WHERE id = ${destinoId} FOR UPDATE;
    `;

    if (!destino) {
      this.logger.warn(`Conta de destino ${destinoId} não encontrada`);
      throw new NotFoundException('Destination account not found');
    }

    // Verifica saldo suficiente na conta de origem
    if (origem.balance < amount) {
      this.logger.warn(
        `Saldo insuficiente na conta ${origem.id} para transferência`,
      );
      throw new ConflictException('Insufficient balance for transfer');
    }

    // Atualiza os saldos das contas de origem e destino
    await this.prisma.account.update({
      where: { id: origem.id },
      data: { balance: { decrement: amount } },
    });

    await this.prisma.account.update({
      where: { id: destino.id },
      data: { balance: { increment: amount } },
    });

    await this.prisma.transaction.create({
      data: {
        type: TransactionType.TRANSFER,
        amount: amount,
        status: TransactionStatus.COMPLETED,
        accounts: {
          create: [
            { accountId: origem.id, role: AccountRole.ORIGIN },
            { accountId: destino.id, role: AccountRole.DESTINY },
          ],
        },
      },
    });

    this.logger.debug(
      `Transferência de ${amount} concluída da conta ${origem.id} para a conta ${destino.id}`,
    );
  }
}

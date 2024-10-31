import { Injectable, ConflictException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CreateAccountsRequestDto } from '../infra/dto/create/request.dto';
import { AppLogger } from 'src/modules/logger/logger.service';
import { Account } from 'src/modules/sequelize/models/account.model';
import { Transaction } from 'src/modules/sequelize/models/transaction.model';
import { CreateAccountResponseDto } from '../infra/dto/create/response.dto';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly logger: AppLogger,
  ) {}

  async execute(
    payload: CreateAccountsRequestDto,
  ): Promise<CreateAccountResponseDto> {
    const accountNumbers = payload.accounts.map((account) => account.number);

    const existingAccounts = await Account.findAll({
      where: {
        number: accountNumbers,
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
      await this.sequelize.transaction(async (transaction) => {
        const accounts = await Account.bulkCreate(payload.accounts, {
          transaction,
          returning: true,
        });

        this.logger.log(`Contas criadas :${accounts.length}`);

        for (const transacao of payload.transactions) {
          const { type, accountId, amount, destinyId } = transacao;
          const origem = await this.lockAccount(accountId, transaction);

          if (!origem) {
            this.logger.warn(`Conta ${accountId} não encontrada`);
            throw new ConflictException(`Account ${accountId} not found`);
          }

          if (type === 'DEPOSIT') {
            await this.handleDeposit(origem, amount, transaction);
          } else if (type === 'WITHDRAW') {
            await this.handleWithdraw(origem, amount, transaction);
          } else if (type === 'TRANSFER') {
            if (!destinyId) {
              this.logger.warn(`Conta de é obrigatório para transferência`);
              throw new ConflictException(
                'Destination is mandatory for transfer',
              );
            }

            const destinoAccount = await this.lockAccount(
              destinyId,
              transaction,
            );
            if (!destinoAccount) {
              this.logger.warn(`Conta de destino ${accountId} não encontrada`);
              throw new ConflictException(
                `Destination account ${destinyId} not found`,
              );
            }

            await this.handleTransfer(
              origem,
              destinoAccount,
              amount,
              transaction,
            );
          }
        }
      });
      return {
        message: 'Accounts and transactions processed successfully!',
      };
    } catch (error) {
      this.logger.error(`Erro no processamento: ${error.message}`);
      throw error;
    }
  }

  private async lockAccount(
    accountId: number,
    transaction: any,
  ): Promise<Account> {
    return Account.findOne({
      where: { number: accountId },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
  }

  private async handleDeposit(
    origem: Account,
    amount: number,
    transaction: any,
  ) {
    origem.balance += amount;
    await origem.save({ transaction });

    await Transaction.create(
      {
        type: 'DEPOSIT',
        amount: amount,
        accountId: origem.id,
      },
      { transaction },
    );

    this.logger.log(`Depósito de ${amount} na conta ${origem.number}`);
  }

  private async handleWithdraw(
    origem: Account,
    amount: number,
    transaction: any,
  ) {
    if (origem.balance < amount) {
      this.logger.warn(`Saldo insuficiente na conta ${origem.number}`);
      throw new ConflictException(
        `Insufficient balance in account ${origem.number}`,
      );
    }

    origem.balance -= amount;
    await origem.save({ transaction });

    await Transaction.create(
      {
        type: 'WITHDRAW',
        amount: amount,
        accountId: origem.id,
      },
      { transaction },
    );

    this.logger.log(`Saque de ${amount} da conta ${origem.number}`);
  }

  private async handleTransfer(
    origem: Account,
    destino: Account,
    amount: number,
    transaction: any,
  ) {
    if (origem.balance < amount) {
      this.logger.warn(
        `Saldo insuficiente na conta ${origem.number} para transferir`,
      );
      throw new ConflictException(
        `Insufficient balance in account ${origem.number} for transfer`,
      );
    }

    origem.balance -= amount;
    destino.balance += amount;
    await origem.save({ transaction });
    await destino.save({ transaction });

    await Transaction.create(
      {
        type: 'TRANSFER',
        amount: amount,
        accountId: origem.id,
        destinoId: destino.id,
      },
      { transaction },
    );

    this.logger.log(
      `Transferência de ${amount} da conta ${origem.number} para a conta ${destino.number}`,
    );
  }
}

import { Injectable, ConflictException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CreateAccountsRequestDto } from '../infra/dto/create/request.dto';
import { AppLogger } from 'src/modules/logger/logger.service';
import { Account } from 'src/modules/sequelize/models/account.model';
import { Transaction } from 'src/modules/sequelize/models/transaction.model';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly logger: AppLogger,
  ) {}

  async execute(payload: CreateAccountsRequestDto): Promise<any> {
    const accountNumbers = payload.accounts.map((account) => account.number);

    // Verifica se já existem contas com os números fornecidos
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

        this.logger.log(`Contas: ${accounts.length} criadas com sucesso`);

        const accountMap = new Map(
          accounts.map((account) => [account.number, account]),
        );

        // Executa as transações
        for (const transacao of payload.transactions) {
          const { type, accountId, amount, destinyId } = transacao;
          const origem = accountMap.get(accountId);

          if (!origem) {
            throw new ConflictException(`Conta ${accountId} não encontrada`);
          }

          if (type === 'DEPOSIT') {
            // Realiza o depósito
            origem.balance += amount;
            await origem.save({ transaction });

            // Cria a transação de depósito
            await Transaction.create(
              {
                type: 'DEPOSIT',
                amount: amount,
                accountId: origem.id,
              },
              { transaction },
            );

            this.logger.log(`Depósito de ${amount} na conta ${accountId}`);
          } else if (type === 'WITHDRAW') {
            if (origem.balance < amount) {
              throw new ConflictException(
                `Saldo insuficiente na conta ${accountId}`,
              );
            }

            // Realiza o saque
            origem.balance -= amount;
            await origem.save({ transaction });

            // Cria a transação de saque
            await Transaction.create(
              {
                type: 'WITHDRAW',
                amount: amount,
                accountId: origem.id,
              },
              { transaction },
            );

            this.logger.log(`Saque de ${amount} da conta ${accountId}`);
          } else if (type === 'TRANSFER') {
            if (!destinyId) {
              throw new ConflictException(
                'Destino é obrigatório para transferência',
              );
            }

            const destinoAccount = accountMap.get(destinyId);
            if (!destinoAccount) {
              throw new ConflictException(
                `Conta de destino ${destinyId} não encontrada`,
              );
            }

            if (origem.balance < amount) {
              throw new ConflictException(
                `Saldo insuficiente na conta ${accountId} para transferência`,
              );
            }

            // Realiza a transferência
            origem.balance -= amount;
            destinoAccount.balance += amount;
            await origem.save({ transaction });
            await destinoAccount.save({ transaction });

            // Cria a transação de transferência
            await Transaction.create(
              {
                type: 'TRANSFER',
                amount: amount,
                accountId: origem.id,
                destinoId: destinoAccount.id,
              },
              { transaction },
            );

            this.logger.log(
              `Transferência de ${amount} da conta ${accountId} para a conta ${destinyId}`,
            );
          }
        }

        return {
          message: 'Contas e transações processadas com sucesso!',
        };
      });
    } catch (error) {
      this.logger.error(`Erro no processamento: ${error.message}`);
      throw error;
    }
  }
}

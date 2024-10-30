import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { LoggerModule } from './modules/logger/logger.module';
import { AccountModule } from './modules/account/account.module';
import { TransactionModule } from './modules/transaction/transaction.module';

@Module({
  imports: [PrismaModule, LoggerModule, AccountModule, TransactionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

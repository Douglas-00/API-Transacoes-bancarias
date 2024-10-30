import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerModule } from './modules/logger/logger.module';
import { AccountModule } from './modules/account/account.module';
import { Account } from './modules/sequelize/models/account.model';
import { Transaction } from './modules/sequelize/models/transaction.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Password@16',
      database: 'desafio',
      models: [Account, Transaction],
      autoLoadModels: true,
      synchronize: true,
    }),
    LoggerModule,
    AccountModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

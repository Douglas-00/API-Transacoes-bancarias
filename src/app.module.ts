import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerModule } from './modules/logger/logger.module';
import { AccountModule } from './modules/account/account.module';
import { Account } from './modules/sequelize/models/account.model';
import { Transaction } from './modules/sequelize/models/transaction.model';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
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

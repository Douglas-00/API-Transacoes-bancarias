import { Module } from '@nestjs/common';
import { CreateTransactionUseCase } from './useCases/create.useCase';
import { CreateTransactionController } from './infra/controllers/create.controller';

@Module({
  providers: [CreateTransactionUseCase],
  controllers: [CreateTransactionController],
  exports: [],
})
export class TransactionModule {}

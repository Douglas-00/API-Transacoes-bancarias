import { Module } from '@nestjs/common';
import { CreateAccountUseCase } from './useCases/create.useCase';
import { CreateAccountController } from './infra/controllers/create.controller';

@Module({
  providers: [CreateAccountUseCase],
  controllers: [CreateAccountController],
  exports: [],
})
export class AccountModule {}

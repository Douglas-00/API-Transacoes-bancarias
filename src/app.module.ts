import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { LoggerModule } from './modules/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

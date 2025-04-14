import { Global, Module } from '@nestjs/common';
import { LogService } from './log.service';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { LogQuery } from './log.query';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [LogService, LogQuery],
  exports: [LogService],
})
export class LogModule {}

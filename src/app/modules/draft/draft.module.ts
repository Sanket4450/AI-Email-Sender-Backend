import { Module } from '@nestjs/common';
import { DraftService } from './draft.service';
import { DraftController } from './draft.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { DraftQuery } from './draft.query';

@Module({
  imports: [PrismaModule],
  controllers: [DraftController],
  providers: [DraftService, DraftQuery],
})
export class DraftModule {}

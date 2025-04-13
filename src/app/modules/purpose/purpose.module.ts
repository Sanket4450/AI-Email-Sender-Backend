import { Module } from '@nestjs/common';
import { PurposeService } from './purpose.service';
import { PurposeController } from './purpose.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { PurposeQuery } from './purpose.query';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [PrismaModule, TagModule],
  controllers: [PurposeController],
  providers: [PurposeService, PurposeQuery],
  exports: [PurposeService],
})
export class PurposeModule {}

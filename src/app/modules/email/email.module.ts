import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { SenderModule } from '../sender/sender.module';
import { ESPModule } from '../esp/esp.module';
import { EmailQuery } from './email.query';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [PrismaModule, SenderModule, ESPModule, TagModule],
  providers: [EmailService, EmailQuery],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}

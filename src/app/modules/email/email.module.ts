import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { SenderModule } from '../sender/sender.module';
import { ESPModule } from '../esp/esp.module';

@Module({
  imports: [PrismaModule, SenderModule, ESPModule],
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}

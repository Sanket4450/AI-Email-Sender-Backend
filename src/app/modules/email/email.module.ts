import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { SenderModule } from '../sender/sender.module';
import { SendGridModule } from '../esp/sendgrid/sendgrid.module';

@Module({
  imports: [PrismaModule, SenderModule, SendGridModule],
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}

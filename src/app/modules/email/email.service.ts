import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [PrismaModule],
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
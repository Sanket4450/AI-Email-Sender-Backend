import { Module } from '@nestjs/common';
import { ScheduledEmailService } from './scheduled-email.service';
import { ScheduledEmailController } from './scheduled-email.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScheduledEmailController],
  providers: [ScheduledEmailService],
})
export class ScheduledEmailModule {}

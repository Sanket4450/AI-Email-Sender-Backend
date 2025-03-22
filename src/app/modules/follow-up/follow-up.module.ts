import { Module } from '@nestjs/common';
import { FollowUpService } from './follow-up.service';
import { FollowUpController } from './follow-up.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { ESPModule } from '../esp/esp.module';

@Module({
  imports: [PrismaModule, EmailModule, ESPModule],
  controllers: [FollowUpController],
  providers: [FollowUpService],
})
export class FollowUpModule {}

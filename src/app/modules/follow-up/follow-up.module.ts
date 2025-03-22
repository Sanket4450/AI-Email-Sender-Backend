import { Module } from '@nestjs/common';
import { FollowUpService } from './follow-up.service';
import { FollowUpController } from './follow-up.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [FollowUpController],
  providers: [FollowUpService],
})
export class FollowUpModule {}

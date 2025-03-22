import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../config/prisma/prisma.module';
import { CompanyModule } from './modules/company/company.module';
import { TagModule } from './modules/tag/tag.module';
import { ContactModule } from './modules/contact/contact.module';
import { SenderModule } from './modules/sender/sender.module';
import { DraftModule } from './modules/draft/draft.module';
import { ScheduledEmailModule } from './modules/scheduled-email/scheduled-email.module';
import { EmailModule } from './modules/email/email.module';
import { FollowUpModule } from './modules/follow-up/follow-up.module';

@Module({
  imports: [
    PrismaModule,
    CompanyModule,
    ContactModule,
    TagModule,
    SenderModule,
    DraftModule,
    ScheduledEmailModule,
    EmailModule,
    FollowUpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

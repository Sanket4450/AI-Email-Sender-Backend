import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './modules/company/company.module';
import { TagModule } from './modules/tag/tag.module';
import { ContactModule } from './modules/contact/contact.module';
import { SenderModule } from './modules/sender/sender.module';
import { DraftModule } from './modules/draft/draft.module';
import { EmailModule } from './modules/email/email.module';
import { FollowUpModule } from './modules/follow-up/follow-up.module';
import { AIModule } from './modules/ai/ai.module';
import { LogModule } from './modules/log/log.module';

@Module({
  imports: [
    CompanyModule,
    ContactModule,
    TagModule,
    SenderModule,
    DraftModule,
    EmailModule,
    FollowUpModule,
    AIModule,
    LogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

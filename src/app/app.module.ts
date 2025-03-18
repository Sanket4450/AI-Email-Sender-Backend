import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../config/prisma/prisma.module';
import { CompanyModule } from './modules/company/company.module';
import { TagModule } from './modules/tag/tag.module';
import { ContactModule } from './modules/contact/contact.module';
import { ESPModule } from './modules/esp/esp.module';
import { SenderModule } from './modules/sender/sender.module';

@Module({
  imports: [
    PrismaModule,
    CompanyModule,
    ContactModule,
    TagModule,
    ESPModule,
    SenderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

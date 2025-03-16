import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../config/prisma/prisma.module';
import { CompanyModule } from './modules/company/company.module';
import { TagModule } from './modules/tag/tag.module';

@Module({
  imports: [PrismaModule, CompanyModule, TagModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

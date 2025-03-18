import { Module } from '@nestjs/common';
import { SenderService } from './sender.service';
import { SenderController } from './sender.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [PrismaModule, CompanyModule],
  controllers: [SenderController],
  providers: [SenderService],
})
export class SenderModule {}

import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [PrismaModule, CompanyModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}

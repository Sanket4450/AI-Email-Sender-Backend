import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { CompanyModule } from '../company/company.module';
import { ContactQuery } from './contact.query';

@Module({
  imports: [PrismaModule, CompanyModule],
  controllers: [ContactController],
  providers: [ContactService, ContactQuery],
})
export class ContactModule {}

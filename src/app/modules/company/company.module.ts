import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { CompanyQuery } from './company.query';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [PrismaModule, TagModule],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyQuery],
  exports: [CompanyService],
})
export class CompanyModule {}

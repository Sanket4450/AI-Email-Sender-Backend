import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { CompanyQuery } from './company.query';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyQuery],
  exports: [CompanyService],
})
export class CompanyModule {}

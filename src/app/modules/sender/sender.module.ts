import { Module } from '@nestjs/common';
import { SenderService } from './sender.service';
import { SenderController } from './sender.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { CompanyModule } from '../company/company.module';
import { CryptoModule } from '../crypto/crypto.module';
import { SenderQuery } from './sender.query';

@Module({
  imports: [PrismaModule, CompanyModule, CryptoModule],
  controllers: [SenderController],
  providers: [SenderService, SenderQuery],
  exports: [SenderService],
})
export class SenderModule {}

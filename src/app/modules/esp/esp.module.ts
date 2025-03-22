import { Module } from '@nestjs/common';
import { ESPService } from './esp.service';
import { SendGridModule } from './sendgrid/sendgrid.module';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
  imports: [SendGridModule, CryptoModule],
  providers: [ESPService],
  exports: [ESPService],
})
export class ESPModule {}

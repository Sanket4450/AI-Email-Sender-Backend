import { Module } from '@nestjs/common';
import { ESPService } from './esp.service';
import { SendGridModule } from './sendgrid/sendgrid.module';

@Module({
  imports: [SendGridModule],
  providers: [ESPService],
  exports: [ESPService],
})
export class ESPModule {}

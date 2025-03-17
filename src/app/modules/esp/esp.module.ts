import { Module } from '@nestjs/common';
import { ESPService } from './esp.service';
import { ESPController } from './esp.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ESPController],
  providers: [ESPService],
})
export class ESPModule {}

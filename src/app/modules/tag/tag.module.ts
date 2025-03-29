import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { TagQuery } from './tag.query';

@Module({
  imports: [PrismaModule],
  controllers: [TagController],
  providers: [TagService, TagQuery],
})
export class TagModule {}

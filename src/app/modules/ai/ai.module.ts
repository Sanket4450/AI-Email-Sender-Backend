import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { LLMService } from './llm.service';

@Module({
  controllers: [AIController],
  providers: [AIService, LLMService],
})
export class AIModule {}

import { Injectable } from '@nestjs/common';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { LLMService } from './llm.service';

@Injectable()
export class AIService {
  constructor(private readonly llmService: LLMService) {}

  async generateEmail(body: GenerateEmailDto) {
    const { prompt } = body;

    return this.llmService.generatePersonaliedEmail(prompt);
  }
}

import { Injectable } from '@nestjs/common';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { LLMService } from './llm.service';
import { LogService } from '../log/log.service';
import { ChatCompletionChunk } from 'openai/resources/chat';
import { Stream } from 'openai/streaming';

@Injectable()
export class AIService {
  constructor(
    private readonly llmService: LLMService,
    private readonly logService: LogService,
  ) {}

  async generateEmail(body: GenerateEmailDto) {
    const { prompt } = body;

    return this.llmService.generatePersonaliedEmail(prompt);
  }

  async handleSaveGeneratedEmail(
    body: GenerateEmailDto,
    stream: Stream<ChatCompletionChunk>,
  ) {
    const { prompt } = body;

    let generatedResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) generatedResponse += content;
    }

    try {
      await this.saveGeneratedEmail(prompt, generatedResponse, false);
    } catch (error) {
      await this.saveGeneratedEmail(prompt, '', true);
      try {
      } catch (error) {
        console.log(
          `Failed to save generated email log:`,
          new Date().toLocaleString(),
          prompt,
        );
      }
    }
  }

  async saveGeneratedEmail(
    prompt: string,
    response: string,
    isError: boolean = false,
  ) {
    await this.logService.createLLMLog({
      prompt,
      response,
      isError,
    });
  }
}

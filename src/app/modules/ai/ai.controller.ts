import { Body, Controller, Post, Res } from '@nestjs/common';
import { AIService } from './ai.service';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { Response } from 'express';

@Controller('api/ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('generate/email')
  async generateEmail(@Body() body: GenerateEmailDto, @Res() res: Response) {
    const stream = await this.aiService.generateEmail(body);

    const [stream1, stream2] = stream.tee();

    this.aiService.handleSaveGeneratedEmail(body, stream1);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of stream2) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) res.write(content);
    }

    return res.end();
  }
}

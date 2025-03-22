import { Body, Controller, Post, Res } from '@nestjs/common';
import { AIService } from './ai.service';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { Response } from 'express';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('generate/email')
  async generateEmail(@Body() body: GenerateEmailDto, @Res() res: Response) {
    const stream = await this.aiService.generateEmail(body);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    return stream;
  }
}

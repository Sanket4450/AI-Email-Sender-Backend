import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { VALUES } from 'src/app/utils/constants';
import { PromptService } from './prompt.service';

interface GenerateResponsePrompts {
  system: string;
  user: string;
}

@Injectable()
export class LLMService extends PromptService {
  private openai: OpenAI;

  constructor() {
    super();
    this.openai = new OpenAI({
      baseURL: VALUES.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private async generateResponse(prompts: GenerateResponsePrompts) {
    const completion = await this.openai.chat.completions.create({
      model: VALUES.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: prompts.system,
        },
        {
          role: 'user',
          content: prompts.user,
        },
      ],
    });

    return completion.choices[0].message.content;
  }

  private async generateResponseStream(prompts: GenerateResponsePrompts) {
    const completion = await this.openai.chat.completions.create({
      model: VALUES.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: prompts.system,
        },
        {
          role: 'user',
          content: prompts.user,
        },
      ],
      stream: true,
    });

    return completion;
  }

  private transformJsonResponse(str: string) {
    let transformedStr = str;

    const startIndex = str.indexOf('[');
    const endIndex = str.lastIndexOf(']');

    if (startIndex !== -1 && endIndex !== -1) {
      transformedStr = str.substring(startIndex, endIndex + 1);
    }

    try {
      return JSON.parse(transformedStr);
    } catch (error) {
      return [];
    }
  }

  private transformHtmlResponse(str: string): string {
    let transformedStr = str;

    const startIndex = str.lastIndexOf('<html>');
    const endIndex = str.indexOf('</html>');

    if (startIndex !== -1 && endIndex !== -1) {
      transformedStr = str.substring(startIndex, endIndex + 7);
    }

    const cleanedHtml = transformedStr
      .replaceAll('\n', '')
      .replaceAll('\r', '');

    return cleanedHtml;
  }

  private transformTextResponse(str: string): string {
    return str.trim().replace(/^"|"$/g, '');
  }

  async generatePersonaliedEmail(userPrompt: string) {
    const prompts = {
      system: this.GenerateEmailSystemPrompt,
      user: userPrompt,
    };

    return this.generateResponseStream(prompts);
  }
}

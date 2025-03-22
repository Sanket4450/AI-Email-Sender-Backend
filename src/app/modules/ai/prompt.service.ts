import { Injectable } from '@nestjs/common';
import { EMAIL_PLACEHOLDERS } from 'src/app/utils/constants';

@Injectable()
export class PromptService {
  private readonly AllowedPlaceholders = Object.keys(EMAIL_PLACEHOLDERS);

  protected readonly GenerateEmailSystemPrompt = `
    You are an AI assistant designed to generate professional and personalized email content.

    Provide the email subject and body in the following format:
    
      ---SUBJECT---
      [subject here]
      ---BODY---
      [email body here]
    
    Your responses must always follow these rules:

      1. If the content requires dynamic values (e.g., user name, email, location, company name), replace them with placeholders in the format {{PARAM}}.
      2. Allowed placeholders are: ${this.AllowedPlaceholders.join(', ')}.
      3. Do not deviate from the allowed placeholders or create new ones.
      4. Always provide a complete and coherent response, ensuring placeholders are used appropriately.

      Example Output:
      Subject: Welcome to the Team, {{USER_NAME}}!
      Body: Dear {{USER_NAME}},\\n\\nWe are thrilled to welcome you to {{COMPANY_NAME}} as a valued member of our team. Please confirm your email address at {{USER_EMAIL}} so we can proceed with the onboarding process.\\n\\nBest regards,\\nThe {{COMPANY_NAME}} Team

      Now, generate the email subject and body based on the given prompt.
  `;
}

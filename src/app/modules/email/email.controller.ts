import { Controller, Post, Body, Get, Param, Headers } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { GetEmailsDto } from './dto/get-emails.dto';

@Controller('api/emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // Create a new email
  @Post()
  async createEmail(@Body() body: CreateEmailDto) {
    return this.emailService.createEmail(body);
  }

  // Get all emails with query
  @Post('get')
  async getEmails(@Body() query: GetEmailsDto) {
    return this.emailService.getEmails(query);
  }

  // Get a single email by ID
  @Get(':id')
  async getSingleEmail(@Param('id') id: string) {
    return this.emailService.getSingleEmail(id);
  }

  @Post('event/webhook')
  handleEmailEventWebhook(@Headers() headers: any, @Body() body: any[]) {
    return this.emailService.handleEmailEventWebhook(headers, body);
  }
}

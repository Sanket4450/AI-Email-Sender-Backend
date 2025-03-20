import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { GetEmailsDto } from './dto/get-emails.dto';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // Create a new email
  @Post()
  async create(@Body() body: CreateEmailDto) {
    return this.emailService.create(body);
  }

  // Update an email (only scheduledAt can be updated)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateEmailDto) {
    return this.emailService.update(id, body);
  }

  // Delete an email (only if it's scheduled)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.emailService.remove(id);
  }

  // Get all emails with filters
  @Get()
  async findAll(@Query() filters: GetEmailsDto) {
    return this.emailService.findAll(filters);
  }

  // Get a single email by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.emailService.findOne(id);
  }
}

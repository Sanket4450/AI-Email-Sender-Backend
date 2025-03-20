import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ScheduledEmailService } from './scheduled-email.service';
import { CreateScheduledEmailDto } from './dto/create-scheduled-email.dto';
import { UpdateScheduledEmailDto } from './dto/update-scheduled-email.dto';

@Controller('api/scheduled-emails')
export class ScheduledEmailController {
  constructor(private readonly draftService: ScheduledEmailService) {}

  // Create a new draft
  @Post()
  async createScheduledEmail(@Body() body: CreateScheduledEmailDto) {
    return this.draftService.createScheduledEmail(body);
  }

  // Update a draft by ID
  @Patch(':id')
  async updateScheduledEmail(
    @Param('id') id: string,
    @Body() body: UpdateScheduledEmailDto,
  ) {
    return this.draftService.updateScheduledEmail(id, body);
  }

  // Delete a draft by ID
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteScheduledEmail(@Param('id') id: string) {
    return this.draftService.deleteScheduledEmail(id);
  }

  // Get all drafts
  @Get()
  async getScheduledEmails() {
    return this.draftService.getScheduledEmails();
  }

  // Get a draft by ID
  @Get(':id')
  async getSingleScheduledEmail(@Param('id') id: string) {
    return this.draftService.getSingleScheduledEmail(id);
  }
}

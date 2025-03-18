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
import { SenderService } from './sender.service';
import { CreateSenderDto } from './dto/create-sender.dto';
import { UpdateSenderDto } from './dto/update-sender.dto';

@Controller('api/contacts')
export class SenderController {
  constructor(private readonly contactService: SenderService) {}

  // Create a new contact
  @Post()
  async createSender(@Body() body: CreateSenderDto) {
    return this.contactService.createSender(body);
  }

  // Update a contact by ID
  @Patch(':id')
  async updateSender(@Param('id') id: string, @Body() body: UpdateSenderDto) {
    return this.contactService.updateSender(id, body);
  }

  // Delete a contact by ID
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSender(@Param('id') id: string) {
    return this.contactService.deleteSender(id);
  }

  // Get all contacts
  @Get()
  async getSenders() {
    return this.contactService.getSenders();
  }

  // Get a contact by ID
  @Get(':id')
  async getSingleSender(@Param('id') id: string) {
    return this.contactService.getSingleSender(id);
  }
}

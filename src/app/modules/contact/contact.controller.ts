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
  Query,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { GetContactsDto } from './dto/get-contacts.dto';

@Controller('api/contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Create a new contact
  @Post()
  async createContact(@Body() body: CreateContactDto) {
    return this.contactService.createContact(body);
  }

  // Update a contact by ID
  @Patch(':id')
  async updateContact(@Param('id') id: string, @Body() body: UpdateContactDto) {
    return this.contactService.updateContact(id, body);
  }

  // Delete a contact by ID
  @Delete(':id')
  async deleteContact(@Param('id') id: string) {
    return this.contactService.deleteContact(id);
  }

  // Get all contacts
  @Post('get')
  async getContacts(@Body() body: GetContactsDto) {
    return this.contactService.getContacts(body);
  }

  // Get a contact by ID
  @Get(':id')
  async getSingleContact(@Param('id') id: string) {
    return this.contactService.getSingleContact(id);
  }
}

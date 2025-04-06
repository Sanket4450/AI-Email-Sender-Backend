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
import { DraftService } from './draft.service';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { GetDraftsDto } from './dto/get-drafts.dto';

@Controller('api/drafts')
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  // Create a new draft
  @Post()
  async createDraft(@Body() body: CreateDraftDto) {
    body.validateForScheduling();
    return this.draftService.createDraft(body);
  }

  // Update a draft by ID
  @Patch(':id')
  async updateDraft(@Param('id') id: string, @Body() body: UpdateDraftDto) {
    return this.draftService.updateDraft(id, body);
  }

  // Delete a draft by ID
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDraft(@Param('id') id: string) {
    return this.draftService.deleteDraft(id);
  }

  // Get all drafts
  @Post('get')
  async getDrafts(@Body() body: GetDraftsDto) {
    return this.draftService.getDrafts(body);
  }

  // Get a draft by ID
  @Get(':id')
  async getSingleDraft(@Param('id') id: string) {
    return this.draftService.getSingleDraft(id);
  }
}

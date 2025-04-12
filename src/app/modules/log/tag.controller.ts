import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-llm-log.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { GetTagsDto } from './dto/get-logs.dto';

@Controller('api/tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  // Create a new tag
  @Post()
  async createTag(@Body() body: CreateTagDto) {
    return this.tagService.createTag(body);
  }

  // Update an tag by ID
  @Patch(':id')
  async updateTag(@Param('id') id: string, @Body() body: UpdateTagDto) {
    return this.tagService.updateTag(id, body);
  }

  // Delete an tag by ID
  @Delete(':id')
  async deleteTag(@Param('id') id: string) {
    return this.tagService.deleteTag(id);
  }

  // Get all tags
  @Get()
  async getTags(@Query() query: GetTagsDto) {
    return this.tagService.getTags(query);
  }
}

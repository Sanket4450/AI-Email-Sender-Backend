import { Controller, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { FollowUpService } from './follow-up.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { GetFollowUpsDto } from './dto/get-follow-up.dto';

@Controller('api/follow-ups')
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  // Create a new follow-up
  @Post()
  async createFollowUp(@Body() body: CreateFollowUpDto) {
    return this.followUpService.createFollowUp(body);
  }

  // Update a follow-up by ID
  @Patch(':id')
  async updateFollowUp(
    @Param('id') id: string,
    @Body() body: UpdateFollowUpDto,
  ) {
    return this.followUpService.updateFollowUp(id, body);
  }

  // Delete a follow-up by ID
  @Delete(':id')
  async deleteFollowUp(@Param('id') id: string) {
    return this.followUpService.deleteFollowUp(id);
  }

  // Get all follow-ups
  @Post('get')
  async getFollowUps(@Body() body: GetFollowUpsDto) {
    return this.followUpService.getFollowUps(body);
  }
}

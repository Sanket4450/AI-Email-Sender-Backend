import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { PurposeService } from './purpose.service';
import { CreatePurposeyDto } from './dto/create-purpose.dto';
import { UpdatePurposeyDto } from './dto/update-purpose.dto';
import { GetPurposesDto } from './dto/get-purposes.dto';

@Controller('api/purposes')
export class PurposeController {
  constructor(private readonly purposeService: PurposeService) {}

  // Create a new purpose
  @Post()
  async createPurpose(@Body() body: CreatePurposeyDto) {
    return this.purposeService.createPurpose(body);
  }

  // Update a purpose by ID
  @Patch(':id')
  async updatePurpose(
    @Param('id') id: string,
    @Body() body: UpdatePurposeyDto,
  ) {
    return this.purposeService.updatePurpose(id, body);
  }

  // Delete a purpose by ID
  @Delete(':id')
  async deletePurpose(@Param('id') id: string) {
    return this.purposeService.deletePurpose(id);
  }

  // Get all purposes
  @Post('get')
  async getPurposes(@Body() body: GetPurposesDto) {
    return this.purposeService.getPurposes(body);
  }

  // Get a purpose by ID
  @Get(':id')
  async getSinglePurpose(@Param('id') id: string) {
    return this.purposeService.getSinglePurpose(id);
  }
}

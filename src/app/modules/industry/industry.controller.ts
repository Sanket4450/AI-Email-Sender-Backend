import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { IndustryService } from './industry.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';

@Controller('industries')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  // Create a new industry
  @Post()
  async createIndustry(@Body() body: CreateIndustryDto) {
    return this.industryService.createIndustry(body);
  }

  // Update an industry by ID
  @Patch(':id')
  async updateIndustry(
    @Param('id') id: string,
    @Body() body: UpdateIndustryDto,
  ) {
    return this.industryService.updateIndustry(id, body);
  }

  // Delete an industry by ID
  @Delete(':id')
  async deleteIndustry(@Param('id') id: string) {
    return this.industryService.deleteIndustry(id);
  }

  // Get all industries
  @Get()
  async getAllIndustries() {
    return this.industryService.getAllIndustries();
  }
}

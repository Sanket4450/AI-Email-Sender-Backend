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
import { ESPService } from './esp.service';
import { CreateESPDto } from './dto/create-esp.dto';
import { UpdateESPDto } from './dto/update-esp.dto';
import { GetESPsDto } from './dto/get-esps.dto';

@Controller('api/esps')
export class ESPController {
  constructor(private readonly espService: ESPService) {}

  // Create a new esp
  @Post()
  async createESP(@Body() body: CreateESPDto) {
    return this.espService.createESP(body);
  }

  // Update an esp by ID
  @Patch(':id')
  async updateESP(@Param('id') id: string, @Body() body: UpdateESPDto) {
    return this.espService.updateESP(id, body);
  }

  // Delete an esp by ID
  @Delete(':id')
  async deleteESP(@Param('id') id: string) {
    return this.espService.deleteESP(id);
  }

  // Get all esps
  @Get()
  async getESPs(@Query() query: GetESPsDto) {
    return this.espService.getESPs(query);
  }
}

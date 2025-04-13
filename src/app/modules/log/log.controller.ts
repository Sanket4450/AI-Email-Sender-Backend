import {
  Controller,
  Body,
  Get,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LogService } from './log.service';
import { GetLogsDto } from './dto/get-logs.dto';
import { DeleteLogDto } from './dto/delete-log.dto';

@Controller('api/logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  // Delete a log by ID
  @Delete(':id')
  async deleteLog(@Param('id') id: string, @Body() body: DeleteLogDto) {
    return this.logService.deleteLog(id, body);
  }

  // Delete all logs
  @Delete()
  async deleteAllLogs(@Body() body: DeleteLogDto) {
    return this.logService.deleteAllLogs(body);
  }

  // Get all logs
  @Get()
  async getLogs(@Query() query: GetLogsDto) {
    return this.logService.getLogs(query);
  }
}

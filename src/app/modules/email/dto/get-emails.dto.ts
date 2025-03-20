import { IntersectionType } from '@nestjs/mapped-types';
import { EventType } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto, SearchDto } from 'src/app/types/dto/common.dto';

export class GetEmailsDto extends IntersectionType(SearchDto, PaginationDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  contactId?: string;

  @IsOptional()
  @IsBoolean()
  isBounced?: boolean;

  @IsOptional()
  @IsBoolean()
  isSpamReported?: boolean;

  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;
}

import { IntersectionType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto, SearchDto } from 'src/app/types/dto/common.dto';
import { EMAIL_EVENTS } from 'src/app/utils/constants';

export class GetEmailsDto extends IntersectionType(SearchDto, PaginationDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contactIds?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  senderId?: string;

  @IsOptional()
  @IsBoolean()
  isBounced?: boolean;

  @IsOptional()
  @IsBoolean()
  isSpamReported?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(Object.values(EMAIL_EVENTS), { each: true })
  eventTypes?: string[];

  @IsOptional()
  @IsBoolean()
  isDeepSearch?: boolean;
}

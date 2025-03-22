import { IntersectionType } from '@nestjs/mapped-types';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto, SearchDto } from 'src/app/types/dto/common.dto';

export class GetScheduledEmailsDto extends IntersectionType(
  SearchDto,
  PaginationDto,
) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contactIds?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  senderId?: string;
}

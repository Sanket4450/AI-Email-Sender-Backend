import { IntersectionType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PaginationDto, SearchDto } from 'src/app/types/dto/common.dto';

export class GetDraftsDto extends IntersectionType(SearchDto, PaginationDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contactIds?: string[];
}

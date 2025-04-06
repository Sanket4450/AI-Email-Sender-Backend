import { IntersectionType } from '@nestjs/mapped-types';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto, SearchDto } from 'src/app/types/dto/common.dto';

export class GetContactsDto extends IntersectionType(SearchDto, PaginationDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  companyIds?: string[];
}

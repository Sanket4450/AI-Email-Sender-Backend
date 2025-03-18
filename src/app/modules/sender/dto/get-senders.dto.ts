import { IntersectionType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto, SearchDto } from 'src/app/types/dto/common.dto';

export class GetSendersDto extends IntersectionType(SearchDto, PaginationDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyId?: string;
}

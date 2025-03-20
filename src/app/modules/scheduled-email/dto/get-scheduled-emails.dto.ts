import { IntersectionType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto, SearchDto } from 'src/app/types/dto/common.dto';

export class GetScheduledEmailsDto extends IntersectionType(SearchDto, PaginationDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  contactId?: string;
}

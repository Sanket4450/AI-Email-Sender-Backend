import { IntersectionType } from '@nestjs/mapped-types';
import { IsIn, IsString } from 'class-validator';
import { PaginationDto, SearchDto } from 'src/app/types/dto/common.dto';
import { LOG_TYPES } from 'src/app/utils/constants';

export class GetLogsDto extends IntersectionType(SearchDto, PaginationDto) {
  @IsString()
  @IsIn(Object.values(LOG_TYPES))
  type: string;
}

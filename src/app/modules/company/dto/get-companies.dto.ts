import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationDto, SearchDto } from 'src/app/types/dto/common.dto';

export class GetCompaniesDto extends IntersectionType(
  SearchDto,
  PaginationDto,
) {}

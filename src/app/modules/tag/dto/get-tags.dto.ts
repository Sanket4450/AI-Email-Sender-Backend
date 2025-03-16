import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationDto, SearchDto } from 'src/app/types/dto/common.dto';

export class GetTagsDto extends IntersectionType(SearchDto, PaginationDto) {}

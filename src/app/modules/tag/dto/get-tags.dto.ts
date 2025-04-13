import { IntersectionType } from '@nestjs/mapped-types';
import { OptionsDto, PaginationDto, SearchDto } from 'src/app/types/dto/common.dto';

export class GetTagsDto extends IntersectionType(SearchDto, PaginationDto, OptionsDto) {}

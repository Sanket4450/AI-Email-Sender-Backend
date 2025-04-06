import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @IsOptional()
  @IsString()
  search: string;
}

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  page: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  limit: number;
}


export class TagsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

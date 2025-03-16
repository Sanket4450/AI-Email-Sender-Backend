import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class SearchDto {
  @IsOptional()
  @IsString()
  search: string;
}

export class PaginationDto {
  @IsOptional()
  @IsNumberString()
  @IsNotEmpty()
  page: number;

  @IsOptional()
  @IsNumberString()
  @IsNotEmpty()
  limit: number;
}

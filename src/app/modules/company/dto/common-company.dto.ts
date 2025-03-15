import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CommonCompanyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsArray()
  @IsInt({ each: true })
  industries: number[];

  @IsArray()
  @IsInt({ each: true })
  tags: number[];
}

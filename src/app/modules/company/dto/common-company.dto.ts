import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

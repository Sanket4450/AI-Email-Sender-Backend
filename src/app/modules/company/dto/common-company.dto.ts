import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TagsDto } from 'src/app/types/dto/common.dto';

export class CommonCompanyDto extends TagsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}

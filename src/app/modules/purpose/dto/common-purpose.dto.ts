import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TagsDto } from 'src/app/types/dto/common.dto';

export class CommonPurposeDto extends TagsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

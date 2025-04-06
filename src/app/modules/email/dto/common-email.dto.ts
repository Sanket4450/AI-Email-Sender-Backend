import { IsArray, IsString } from 'class-validator';
import { TagsDto } from 'src/app/types/dto/common.dto';

export class CommonEmailDto extends TagsDto {
  @IsString()
  senderId: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsArray()
  @IsString({ each: true })
  contactIds?: string[];
}

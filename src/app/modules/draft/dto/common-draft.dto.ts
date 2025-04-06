import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';
import { TagsDto } from 'src/app/types/dto/common.dto';

export class CommonDraftDto extends TagsDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contactIds?: string[];

  @IsOptional()
  @IsString()
  senderId: string;

  @IsOptional()
  @IsDateString()
  scheduledAt: Date;

  
}

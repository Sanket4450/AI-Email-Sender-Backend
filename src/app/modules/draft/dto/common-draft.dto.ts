import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CommonDraftDto {
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

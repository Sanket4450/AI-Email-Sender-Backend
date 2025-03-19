import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CommonDraftDto {
  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsArray()
  @IsString({ each: true })
  contactIds?: string[];

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

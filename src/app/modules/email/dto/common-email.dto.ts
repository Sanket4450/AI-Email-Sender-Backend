import { IsArray, IsString } from 'class-validator';

export class CommonEmailDto {
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

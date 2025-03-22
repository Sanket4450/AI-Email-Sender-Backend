import { IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CommonScheduledEmailDto {
  @IsString()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsArray()
  @IsString({ each: true })
  contactIds: string[];

  @IsDateString()
  scheduledAt: Date;
}

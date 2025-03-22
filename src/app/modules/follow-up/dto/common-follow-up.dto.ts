import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CommonFollowUpDto {
  @IsString()
  emailId: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsDateString()
  scheduledAt: Date;
}

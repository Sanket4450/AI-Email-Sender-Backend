import { IsDateString, IsString } from 'class-validator';

export class CommonFollowUpDto {
  @IsString()
  emailId: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsDateString()
  scheduledAt: Date;
}

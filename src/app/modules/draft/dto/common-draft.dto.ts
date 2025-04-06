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

  validateForScheduling() {
    if (this.scheduledAt) {
      if (
        !this.subject ||
        !this.body ||
        !this.senderId ||
        !this.contactIds ||
        this.contactIds.length === 0
      ) {
        throw new Error(
          'Subject, body, senderId, and at least one contact id are required for scheduling.',
        );
      }
    }
  }
}

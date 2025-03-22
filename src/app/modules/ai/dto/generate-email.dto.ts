import { IsString } from 'class-validator';

export class GenerateEmailDto {
  @IsString()
  contactId: string;

  @IsString()
  prompt: string;
}

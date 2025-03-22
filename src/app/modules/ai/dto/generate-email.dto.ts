import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateEmailDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}

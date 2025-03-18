import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CommonSenderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsInt()
  target: number;

  @IsString()
  @IsNotEmpty()
  espId: string;
}

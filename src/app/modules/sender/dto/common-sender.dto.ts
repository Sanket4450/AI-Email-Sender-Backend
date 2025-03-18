import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsInt()
  target: number;

  @IsString()
  @IsNotEmpty()
  espId: string;
}

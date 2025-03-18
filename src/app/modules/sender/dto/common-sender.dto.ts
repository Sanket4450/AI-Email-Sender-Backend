import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ESPS } from 'src/app/utils/constants';

export class CommonSenderDto {
  @IsString()
  @IsEnum(Object.values(ESPS))
  esp: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsInt()
  target: number;
}

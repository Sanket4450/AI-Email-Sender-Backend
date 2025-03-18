import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { VALIDATION_MSG } from 'src/app/utils/messages';

export class CommonContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: VALIDATION_MSG.PHONE })
  @MaxLength(10, { message: VALIDATION_MSG.PHONE })
  phone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  linkedInUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

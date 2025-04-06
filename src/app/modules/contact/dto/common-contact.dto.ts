import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TagsDto } from 'src/app/types/dto/common.dto';
import { VALIDATION_MSG } from 'src/app/utils/messages';

export class CommonContactDto extends TagsDto {
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

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyId?: string;
}

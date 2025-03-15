import { IsNotEmpty, IsString } from 'class-validator';

export class CommonIndustryDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

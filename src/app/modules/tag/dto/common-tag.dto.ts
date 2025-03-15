import { IsNotEmpty, IsString } from 'class-validator';

export class CommonTagDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

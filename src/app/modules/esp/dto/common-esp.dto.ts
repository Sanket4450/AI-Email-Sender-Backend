import { IsNotEmpty, IsString } from 'class-validator';

export class CommonESPDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

import { IsString } from 'class-validator';
import { SearchDto } from 'src/app/types/dto/common.dto';

export class GetFollowUpsDto extends SearchDto {
  @IsString()
  emailId: string;
}

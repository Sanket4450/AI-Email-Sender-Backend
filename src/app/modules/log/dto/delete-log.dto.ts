import { IsIn, IsString } from 'class-validator';
import { LOG_TYPES } from 'src/app/utils/constants';

export class DeleteLogDto {
  @IsString()
  @IsIn(Object.values(LOG_TYPES))
  type: string;
}

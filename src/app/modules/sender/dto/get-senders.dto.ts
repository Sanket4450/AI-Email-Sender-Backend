import { IsArray, IsIn, IsOptional } from 'class-validator';
import { SearchDto } from 'src/app/types/dto/common.dto';
import { ESPS } from 'src/app/utils/constants';

export class GetSendersDto extends SearchDto {
  @IsOptional()
  @IsArray()
  @IsIn(Object.values(ESPS), {
    each: true,
    message: `ESP must be one of the following: ${Object.values(ESPS).join(', ')}`,
  })
  esps?: string[];
}

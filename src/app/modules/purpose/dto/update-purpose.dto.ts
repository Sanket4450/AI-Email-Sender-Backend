import { PartialType } from '@nestjs/mapped-types';
import { CommonPurposeDto } from './common-purpose.dto';

export class UpdatePurposeyDto extends PartialType(CommonPurposeDto) {}

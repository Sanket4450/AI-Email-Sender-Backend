import { PartialType } from '@nestjs/mapped-types';
import { CommonSenderDto } from './common-sender.dto';

export class UpdateSenderDto extends PartialType(CommonSenderDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CommonScheduledEmailDto } from './common-scheduled-email.dto';

export class UpdateScheduledEmailDto extends PartialType(
  CommonScheduledEmailDto,
) {}

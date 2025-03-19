import { PartialType } from '@nestjs/mapped-types';
import { CommonDraftDto } from './common-draft.dto';

export class UpdateDraftDto extends PartialType(CommonDraftDto) {}

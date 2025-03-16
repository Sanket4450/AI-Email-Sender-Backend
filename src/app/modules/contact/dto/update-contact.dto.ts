import { PartialType } from '@nestjs/mapped-types';
import { CommonContactDto } from './common-contact.dto';

export class UpdateContactyDto extends PartialType(CommonContactDto) {}

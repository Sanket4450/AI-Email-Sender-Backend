import { PartialType } from '@nestjs/mapped-types';
import { CommonContactDto } from './common-contact.dto';

export class UpdateContactDto extends PartialType(CommonContactDto) {}

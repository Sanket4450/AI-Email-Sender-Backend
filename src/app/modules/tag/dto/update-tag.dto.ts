import { PartialType } from '@nestjs/mapped-types';
import { CommonTagDto } from './common-tag.dto';

export class UpdateTagDto extends PartialType(CommonTagDto) {}

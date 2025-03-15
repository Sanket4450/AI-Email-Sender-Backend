import { PartialType } from '@nestjs/mapped-types';
import { CommonIndustryDto } from './common-industry.dto';

export class UpdateIndustryDto extends PartialType(CommonIndustryDto) {}

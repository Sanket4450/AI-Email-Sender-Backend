import { PartialType } from '@nestjs/mapped-types';
import { CommonCompanyDto } from './common-company.dto';

export class UpdateCompanyyDto extends PartialType(CommonCompanyDto) {}

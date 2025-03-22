import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyyDto } from './dto/create-company.dto';
import { UpdateCompanyyDto } from './dto/update-company.dto';
import { GetCompaniesDto } from './dto/get-companies.dto';

@Controller('api/companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // Create a new company
  @Post()
  async createCompany(@Body() body: CreateCompanyyDto) {
    return this.companyService.createCompany(body);
  }

  // Update a company by ID
  @Patch(':id')
  async updateCompany(
    @Param('id') id: string,
    @Body() body: UpdateCompanyyDto,
  ) {
    return this.companyService.updateCompany(id, body);
  }

  // Delete a company by ID
  @Delete(':id')
  async deleteCompany(@Param('id') id: string) {
    return this.companyService.deleteCompany(id);
  }

  // Get all companies
  @Get()
  async getCompanies(@Query() query: GetCompaniesDto) {
    return this.companyService.getCompanies(query);
  }

  // Get a company by ID
  @Get(':id')
  async getSingleCompany(@Param('id') id: string) {
    return this.companyService.getSingleCompany(id);
  }
}

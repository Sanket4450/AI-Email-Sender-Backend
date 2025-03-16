import { Company, Prisma } from '@prisma/client';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateCompanyyDto } from './dto/create-company.dto';
import { UpdateCompanyyDto } from './dto/update-company.dto';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { responseBuilder } from 'src/app/utils/responseBuilder';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new company
  async createCompany(body: CreateCompanyyDto) {
    const { tags, ...createCompanyBody } = body;

    const existingCompany = await this.prisma.company.findFirst({
      where: { title: body.title },
    });

    if (existingCompany) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        ERROR_MSG.COMPAY_NOT_FOUND,
      );
    }

    await this.prisma.company.create({
      data: {
        ...createCompanyBody,
        tags: { connect: tags.map((tag) => ({ tagId: tag })) },
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.COMPANY_CREATED });
  }

  // Update a company by ID
  async updateCompany(id: string, body: UpdateCompanyyDto) {
    const { tags, ...updateCompanyBody } = body;

    await this.companyExists(id);

    const existingTags = await this.prisma.tag.findMany({
      where: { id: { in: tags } },
    });

    if (existingTags.length !== tags.length) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.ONE_OR_MORE_TAGS_NOT_FOUND,
      );
    }

    await this.prisma.company.update({
      where: { id },
      data: {
        ...updateCompanyBody,
        tags: { connect: tags.map((tag) => ({ tagId: tag })) },
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.COMPANY_UPDATED });
  }

  // Delete a company by ID
  async deleteCompany(id: string) {
    await this.companyExists(id);

    return this.prisma.company.delete({ where: { id } });
  }

  // Get all companies
  async getCompanies() {
    const query = Prisma.sql`
      SELECT * FROM ${Prisma.raw('Company')}
    `;

    return this.prisma.$queryRaw(query);
  }

  // Get a company by ID
  async getSingleCompany(id: string) {
    const query = Prisma.sql`
      SELECT * FROM ${Prisma.raw('Company')}
    `;

    const [company] = await this.prisma.$queryRaw<Company[]>(query);

    if (!company) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.COMPAY_NOT_FOUND,
      );
    }

    return company;
  }

  // Check if a company exists
  async companyExists(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });

    if (!company) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.COMPAY_NOT_FOUND,
      );
    }

    return company;
  }
}

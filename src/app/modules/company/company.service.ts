import { Company, Prisma } from '@prisma/client';
import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateCompanyyDto } from './dto/create-company.dto';
import { UpdateCompanyyDto } from './dto/update-company.dto';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { GetCompaniesDto } from './dto/get-companies.dto';
import { getPagination, getSearchCond } from 'src/app/utils/common.utils';
import { QueryResponse } from 'src/app/types/common.type';
import { CompanyQuery } from './company.query';
import { TagService } from '../tag/tag.service';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tagService: TagService,
    private readonly companyQuery: CompanyQuery,
  ) {}

  // Create a new company
  async createCompany(body: CreateCompanyyDto) {
    const { tags, ...createCompanyBody } = body;

    const existingCompany = await this.prisma.company.findFirst({
      where: {
        title: { equals: body.title, mode: 'insensitive' },
        isDeleted: false,
      },
    });

    if (existingCompany) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        ERROR_MSG.COMPANY_ALREADY_EXISTS,
      );
    }

    // Validate tags if provided
    if (tags?.length) await this.tagService.validateTags(tags);

    await this.prisma.company.create({
      data: {
        ...createCompanyBody,
        ...(tags?.length && {
          companyTags: {
            create: tags.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.COMPANY_CREATED });
  }

  // Update a company by ID
  async updateCompany(id: string, body: UpdateCompanyyDto) {
    const { tags, ...updateCompanyBody } = body;

    await this.companyExists(id);

    if (tags?.length) await this.tagService.validateTags(tags);

    await this.prisma.company.update({
      where: { id },
      data: {
        ...updateCompanyBody,
        ...(tags?.length && {
          companyTags: {
            connectOrCreate: tags.map((tagId) => ({
              where: { companyId_tagId: { companyId: id, tagId } },
              create: { tag: { connect: { id: tagId } } },
            })),
          },
        }),
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.COMPANY_UPDATED });
  }

  // Delete a company by ID
  async deleteCompany(id: string) {
    await this.companyExists(id);

    await this.prisma.company.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    return responseBuilder({
      message: SUCCESS_MSG.COMPANY_WITH_CONTACTS_DELETED,
    });
  }

  // Get all companies
  async getCompanies(query: GetCompaniesDto) {
    const { search } = query;
    const { offset, limit } = getPagination(query);

    const conditions: Prisma.Sql[] = [];

    if (search) {
      const searchKeys = ['c.title', 'c.description', 'c.location', 't.title'];
      conditions.push(getSearchCond(search, searchKeys));
    }

    conditions.push(Prisma.sql`c."isDeleted" = false`);

    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;

    const joinClause = this.companyQuery.getCompanyJoinClause();

    const rawQuery = Prisma.sql`
      WITH "CompaniesCount" AS (
        SELECT
          COUNT(DISTINCT c.id)::INT AS "count"
        FROM company c
        ${joinClause}
        ${whereClause}
      ),

      "CompaniesData" AS (
        SELECT
          ${this.companyQuery.getCompanySelectFields()}
        FROM company c
        ${joinClause}
        ${whereClause}
        GROUP BY c.id
        ORDER BY c."createdAt" DESC
        OFFSET ${offset}
        LIMIT ${limit}
      )
      
      SELECT
        (SELECT "count" FROM "CompaniesCount") AS "count",
        COALESCE((SELECT JSON_AGG("CompaniesData") FROM "CompaniesData"), '[]'::JSON) AS "data";
    `;

    const [companiesResponse] =
      await this.prisma.$queryRaw<QueryResponse<Company>>(rawQuery);

    return responseBuilder({
      message: SUCCESS_MSG.COMPANIES_FETCHED,
      result: companiesResponse,
    });
  }

  // Get a company by ID
  async getSingleCompany(id: string) {
    const rawQuery = Prisma.sql`
      SELECT
        ${this.companyQuery.getCompanySelectFields()}
      FROM company c
      ${this.companyQuery.getCompanyJoinClause()}
      WHERE c.id = ${id} AND c."isDeleted" = false
      GROUP BY c.id
    `;

    const [company] = await this.prisma.$queryRaw<Company[]>(rawQuery);

    if (!company) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.COMPANY_NOT_FOUND,
      );
    }

    return responseBuilder({
      message: SUCCESS_MSG.COMPANY_FETCHED,
      result: company,
    });
  }

  // Check if a company exists
  async companyExists(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id, isDeleted: false },
    });

    if (!company) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.COMPANY_NOT_FOUND,
      );
    }

    return company;
  }
}

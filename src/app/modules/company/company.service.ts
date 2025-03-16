import { Company, Prisma } from '@prisma/client';
import { Injectable, HttpStatus } from '@nestjs/common';
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
        ERROR_MSG.COMPANY_ALREADY_EXISTS,
      );
    }

    // Validate tags if provided
    if (tags?.length) {
      const existingTags = await this.prisma.tag.findMany({
        where: { id: { in: tags } },
      });

      if (existingTags.length !== tags.length) {
        throw new CustomHttpException(
          HttpStatus.NOT_FOUND,
          ERROR_MSG.ONE_OR_MORE_TAGS_NOT_FOUND,
        );
      }
    }

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

    if (tags?.length) {
      const existingTags = await this.prisma.tag.findMany({
        where: { id: { in: tags } },
      });

      if (existingTags.length !== tags.length) {
        throw new CustomHttpException(
          HttpStatus.NOT_FOUND,
          ERROR_MSG.ONE_OR_MORE_TAGS_NOT_FOUND,
        );
      }
    }

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

    return this.prisma.company.delete({ where: { id } });
  }

  // Get all companies
  async getCompanies() {
    const query = Prisma.sql`
      SELECT
        c.id AS id,
        c.title AS title,
        c.description AS description,
        c.location AS location,
        c."createdAt" AS "createdAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', t.id,
              'title', t.title
            )
          ) FILTER (WHERE t.id IS NOT NULL), '[]'::JSON
        )  AS tags
      FROM company c
      LEFT JOIN company_tag ct ON c.id = ct."companyId"
      LEFT JOIN tag t ON ct."tagId" = t.id
      GROUP BY c.id
    `;

    const companies = await this.prisma.$queryRaw<Company[]>(query);

    return responseBuilder({
      message: SUCCESS_MSG.COMPANIES_FETCHED,
      result: companies,
    });
  }

  // Get a company by ID
  async getSingleCompany(id: string) {
    const query = Prisma.sql`
      SELECT
        c.id AS id,
        c.title AS title,
        c.description AS description,
        c.location AS location,
        c."createdAt" AS "createdAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', t.id,
              'title', t.title
            )
          ) FILTER (WHERE t.id IS NOT NULL), '[]'::JSON
        )  AS tags
      FROM company c
      LEFT JOIN company_tag ct ON c.id = ct."companyId"
      LEFT JOIN tag t ON ct."tagId" = t.id
      WHERE c.id = ${id}
      GROUP BY c.id
    `;

    const [company] = await this.prisma.$queryRaw<Company[]>(query);

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
    const company = await this.prisma.company.findUnique({ where: { id } });

    if (!company) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.COMPANY_NOT_FOUND,
      );
    }

    return company;
  }
}

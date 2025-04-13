import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreatePurposeyDto } from './dto/create-purpose.dto';
import { UpdatePurposeyDto } from './dto/update-purpose.dto';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { GetPurposesDto } from './dto/get-purposes.dto';
import { getPagination, getSearchCond } from 'src/app/utils/common.utils';
import { QueryResponse } from 'src/app/types/common.type';
import { PurposeQuery } from './purpose.query';
import { TagService } from '../tag/tag.service';
import { Prisma, Purpose } from 'prisma/generated';

@Injectable()
export class PurposeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tagService: TagService,
    private readonly purposeQuery: PurposeQuery,
  ) {}

  // Create a new purpose
  async createPurpose(body: CreatePurposeyDto) {
    const { tags, ...createPurposeBody } = body;

    const existingPurpose = await this.prisma.purpose.findFirst({
      where: {
        name: { equals: body.name, mode: 'insensitive' },
        isDeleted: false,
      },
    });

    if (existingPurpose) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        ERROR_MSG.PURPOSE_ALREADY_EXISTS,
      );
    }

    // Validate tags if provided
    if (tags?.length) await this.tagService.validateTags(tags);

    await this.prisma.purpose.create({
      data: {
        ...createPurposeBody,
        ...(tags?.length && {
          purposeTags: {
            create: tags.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.PURPOSE_CREATED });
  }

  // Update a purpose by ID
  async updatePurpose(id: string, body: UpdatePurposeyDto) {
    const { tags, ...updatePurposeBody } = body;

    await this.purposeExists(id);

    if (tags?.length) await this.tagService.validateTags(tags);

    await this.prisma.purpose.update({
      where: { id },
      data: {
        ...updatePurposeBody,
        ...(tags?.length && {
          purposeTags: {
            connectOrCreate: tags.map((tagId) => ({
              where: { purposeId_tagId: { purposeId: id, tagId } },
              create: { tag: { connect: { id: tagId } } },
            })),
          },
        }),
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.PURPOSE_UPDATED });
  }

  // Delete a purpose by ID
  async deletePurpose(id: string) {
    await this.purposeExists(id);

    await this.prisma.purpose.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    return responseBuilder({
      message: SUCCESS_MSG.PURPOSE_DELETED,
    });
  }

  // Get all purposes
  async getPurposes(query: GetPurposesDto) {
    const { search } = query;
    const { offset, limit } = getPagination(query);

    const conditions: Prisma.Sql[] = [];

    if (search) {
      const searchKeys = ['p.name', 'p.description', 't.name'];
      conditions.push(getSearchCond(search, searchKeys));
    }

    conditions.push(Prisma.sql`p."isDeleted" = false`);

    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;

    const joinClause = this.purposeQuery.getPurposeJoinClause();

    const rawQuery = Prisma.sql`
      WITH "PurposeCount" AS (
        SELECT
          COUNT(DISTINCT c.id)::INT AS "count"
        FROM purpose p
        ${joinClause}
        ${whereClause}
      ),

      "PurposesData" AS (
        SELECT
          ${this.purposeQuery.getPurposeSelectFields()}
        FROM purpose p
        ${joinClause}
        ${whereClause}
        GROUP BY p.id
        ORDER BY p."createdAt" DESC
        OFFSET ${offset}
        LIMIT ${limit}
      )
      
      SELECT
        (SELECT "count" FROM "PurposeCount") AS "count",
        COALESCE((SELECT JSON_AGG("PurposesData") FROM "PurposesData"), '[]'::JSON) AS "data";
    `;

    const [purposesResponse] =
      await this.prisma.$queryRaw<QueryResponse<Purpose>>(rawQuery);

    return responseBuilder({
      message: SUCCESS_MSG.PURPOSES_FETCHED,
      result: purposesResponse,
    });
  }

  // Get a purpose by ID
  async getSinglePurpose(id: string) {
    const rawQuery = Prisma.sql`
      SELECT
        ${this.purposeQuery.getPurposeSelectFields()}
      FROM purpose p
      ${this.purposeQuery.getPurposeJoinClause()}
      WHERE p.id = ${id} AND p."isDeleted" = false
      GROUP BY p.id
    `;

    const [purpose] = await this.prisma.$queryRaw<Purpose[]>(rawQuery);

    if (!purpose) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.PURPOSE_NOT_FOUND,
      );
    }

    return responseBuilder({
      message: SUCCESS_MSG.PURPOSE_FETCHED,
      result: purpose,
    });
  }

  // Check if a purpose exists
  async purposeExists(id: string) {
    const purpose = await this.prisma.purpose.findUnique({
      where: { id, isDeleted: false },
    });

    if (!purpose) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.PURPOSE_NOT_FOUND,
      );
    }

    return purpose;
  }
}

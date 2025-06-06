import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { GetTagsDto } from './dto/get-tags.dto';
import { getPagination, getSearchCond } from 'src/app/utils/common.utils';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { QueryResponse } from 'src/app/types/common.type';
import { TagQuery } from './tag.query';
import { Prisma, Tag } from 'prisma/generated';

@Injectable()
export class TagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tagQuery: TagQuery,
  ) {}

  // Create a new tag
  async createTag(body: CreateTagDto) {
    const existingTag = await this.prisma.tag.findFirst({
      where: {
        title: { equals: body.title, mode: 'insensitive' },
        isDeleted: false,
      },
    });

    if (existingTag) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        ERROR_MSG.TAG_ALREADY_EXISTS,
      );
    }

    await this.prisma.tag.create({ data: body });

    return responseBuilder({ message: SUCCESS_MSG.TAG_CREATED });
  }

  // Update an tag by ID
  async updateTag(id: string, body: UpdateTagDto) {
    await this.tagExists(id);

    if (body.title) {
      const existingTag = await this.prisma.tag.findFirst({
        where: {
          title: { equals: body.title, mode: 'insensitive' },
          id: { not: id },
          isDeleted: false,
        },
      });

      if (existingTag) {
        throw new CustomHttpException(
          HttpStatus.CONFLICT,
          ERROR_MSG.TAG_ALREADY_EXISTS,
        );
      }
    }

    await this.prisma.tag.update({
      where: { id },
      data: body,
    });

    return responseBuilder({ message: SUCCESS_MSG.TAG_UPDATED });
  }

  // Delete an tag by ID
  async deleteTag(id: string) {
    await this.tagExists(id);

    await this.prisma.tag.update({ where: { id }, data: { isDeleted: true } });

    return responseBuilder({ message: SUCCESS_MSG.TAG_DELETED });
  }

  // Get all tags
  async getTags(query: GetTagsDto) {
    const { search, asOptions } = query;
    const { offset, limit } = getPagination(query);

    const conditions: Prisma.Sql[] = [];

    if (search) {
      const searchKeys = ['t.title'];
      conditions.push(getSearchCond(search, searchKeys));
    }

    conditions.push(Prisma.sql`t."isDeleted" = false`);

    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;

    const joinClause = !asOptions
      ? this.tagQuery.getJoinClause()
      : Prisma.empty;

    const groupByClause = !asOptions ? Prisma.sql`GROUP BY t.id` : Prisma.empty;

    const conditionalPagination = !asOptions
      ? Prisma.sql`LIMIT ${limit} OFFSET ${offset}`
      : Prisma.empty;

    const rawQuery = Prisma.sql`
      WITH "TagCount" AS (
        SELECT
          COUNT(t.id)::INT AS "count"
        FROM tag t
        ${whereClause}
      ),
      
      "Tags" AS (
        SELECT
          ${this.tagQuery.getTagSelectFields(!asOptions)}
        FROM tag t
        ${joinClause}
        ${whereClause}
        ${groupByClause}
        ORDER BY t.title
        ${conditionalPagination}
      )
      
      SELECT
        (SELECT "count" FROM "TagCount") AS "count",
        COALESCE((SELECT JSON_AGG("Tags") FROM "Tags"), '[]'::JSON) AS "data";
    `;


    const [TagResponse] =
      await this.prisma.$queryRaw<QueryResponse<Tag>>(rawQuery);

    return responseBuilder({
      message: SUCCESS_MSG.TAGS_FETCHED,
      result: TagResponse,
    });
  }

  // Check if a tag exists
  async tagExists(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id, isDeleted: false },
    });

    if (!tag) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.TAG_NOT_FOUND,
      );
    }

    return tag;
  }

  async validateTags(tagIds: string[]) {
    const existingTags = await this.prisma.tag.findMany({
      where: { id: { in: tagIds }, isDeleted: false },
    });

    if (existingTags.length !== tagIds.length) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.ONE_OR_MORE_TAGS_NOT_FOUND,
      );
    }
  }
}

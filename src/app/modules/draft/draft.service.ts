import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateDraftDto } from './dto/create-draft.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { Draft, Prisma } from '@prisma/client';
import { GetDraftsDto } from './dto/get-drafts.dto';
import { getPagination, getSearchCond } from 'src/app/utils/common.utils';
import { QueryResponse } from 'src/app/types/common.type';
import { DraftQuery } from './draft.query';
import { SenderService } from '../sender/sender.service';
import { CommonDraftDto } from './dto/common-draft.dto';
import { TagService } from '../tag/tag.service';

@Injectable()
export class DraftService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly senderService: SenderService,
    private readonly tagService: TagService,
    private readonly draftQuery: DraftQuery,
  ) {}

  validateForScheduling(body: Partial<CommonDraftDto>) {
    if (body.scheduledAt) {
      if (
        !body.subject ||
        !body.body ||
        !body.senderId ||
        !body.contactIds ||
        body.contactIds.length === 0
      ) {
        throw new HttpException(
          'Subject, body, senderId, and at least one contact id are required for scheduling.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  // Create a new draft
  async createDraft(body: CreateDraftDto) {
    const { senderId, contactIds, tags, ...createDraftBody } = body;

    this.validateForScheduling(body);

    // Validate that the sender exists
    if (senderId) await this.senderService.senderExists(senderId);

    // Validate that all provided contact IDs exist in the database
    if (contactIds) {
      const existingContacts = await this.prisma.contact.findMany({
        where: { id: { in: contactIds } },
      });

      if (existingContacts.length !== contactIds.length) {
        throw new HttpException(
          ERROR_MSG.ONE_OR_MORE_CONTACTS_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate tags if provided
    if (tags?.length) await this.tagService.validateTags(tags);

    // Create the draft and associate contacts
    await this.prisma.draft.create({
      data: {
        ...createDraftBody,
        ...(senderId && { sender: { connect: { id: senderId } } }),
        draftContacts: contactIds
          ? {
              create: contactIds.map((contactId) => ({
                contact: { connect: { id: contactId } },
              })),
            }
          : undefined,
        ...(tags?.length && {
          draftTags: {
            create: tags.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
      },
    });

    return responseBuilder({
      message: SUCCESS_MSG.DRAFT_CREATED,
    });
  }

  // Update a draft by ID
  async updateDraft(id: string, body: UpdateDraftDto) {
    const { senderId, contactIds = [], tags = [], ...updateDraftBody } = body;

    await this.draftExists(id);

    this.validateForScheduling(body);

    // Validate that the sender exists
    if (senderId) await this.senderService.senderExists(senderId);

    // Validate that all provided contact IDs exist in the database
    if (contactIds.length) {
      const existingContacts = await this.prisma.contact.findMany({
        where: { id: { in: contactIds } },
      });

      if (existingContacts.length !== contactIds.length) {
        throw new HttpException(
          ERROR_MSG.ONE_OR_MORE_CONTACTS_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (tags.length) await this.tagService.validateTags(tags);

    // Update the draft and re-associate contacts
    await this.prisma.draft.update({
      where: { id },
      data: {
        ...updateDraftBody,
        ...(senderId && { sender: { connect: { id: senderId } } }),
        draftContacts: {
          connectOrCreate: contactIds.map((contactId) => ({
            where: { draftId_contactId: { draftId: id, contactId } },
            create: { contact: { connect: { id: contactId } } },
          })),
        },
        draftTags: {
          connectOrCreate: tags.map((tagId) => ({
            where: { draftId_tagId: { draftId: id, tagId } },
            create: { tag: { connect: { id: tagId } } },
          })),
        },
      },
    });

    return responseBuilder({
      message: SUCCESS_MSG.DRAFT_UPDATED,
    });
  }

  // Delete a draft by ID
  async deleteDraft(id: string) {
    await this.draftExists(id);

    await this.prisma.draftTag.deleteMany({ where: { draftId: id } });
    await this.prisma.draftContact.deleteMany({ where: { draftId: id } });
    await this.prisma.draft.delete({ where: { id } });

    return responseBuilder({
      message: SUCCESS_MSG.DRAFT_DELETED,
    });
  }

  // Get all drafts
  async getDrafts(query: GetDraftsDto) {
    const { search, senderIds = [], contactIds = [], tagIds = [] } = query;
    const { offset, limit } = getPagination(query);

    const conditions: Prisma.Sql[] = [];

    if (senderIds.length) {
      conditions.push(Prisma.sql`s.id IN (${Prisma.join(senderIds)})`);
    }

    if (contactIds.length) {
      conditions.push(Prisma.sql`c.id IN (${Prisma.join(contactIds)})`);
    }

    if (tagIds.length) {
      conditions.push(Prisma.sql`t.id IN (${Prisma.join(tagIds)})`);
    }

    if (search) {
      const searchKeys = ['d.subject', 'c.name', 's."displayName"', 't.title'];
      conditions.push(getSearchCond(search, searchKeys));
    }

    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;

    const joinClause = this.draftQuery.getDraftJoinClause();

    const selectClause = this.draftQuery.getDraftSelectFields();

    const subQueries = Prisma.sql`
      WITH contacts_agg AS (${this.draftQuery.getContactsCTE()}),
      tags_agg AS (${this.draftQuery.getTagsCTE()})
    `;

    const rawQuery = Prisma.sql`
      ${subQueries},

      "DraftCount" AS (
        SELECT
          COUNT(DISTINCT d.id)::INT AS "count"
        FROM draft d
        ${joinClause}
        ${whereClause}
      ),

      "DraftsData" AS (
        SELECT
          ${selectClause}
        FROM draft d
        ${joinClause}
        ${whereClause}
        ORDER BY d."createdAt" DESC
        OFFSET ${offset}
        LIMIT ${limit}
      )
      
      SELECT
        (SELECT "count" FROM "DraftCount") AS "count",
        COALESCE((SELECT JSON_AGG("DraftsData") FROM "DraftsData"), '[]'::JSON) AS "data";
      ;
    `;

    const [draftsResponse] =
      await this.prisma.$queryRaw<QueryResponse<Draft>>(rawQuery);

    return responseBuilder({
      message: SUCCESS_MSG.DRAFTS_FETCHED,
      result: draftsResponse,
    });
  }

  // Get a draft by ID
  async getSingleDraft(id: string) {
    const whereClause = Prisma.sql`WHERE d.id = ${id}`;

    const joinClause = this.draftQuery.getDraftJoinClause();

    const selectClause = this.draftQuery.getDraftSelectFields(true);

    const subQueries = Prisma.sql`
      WITH contacts_agg AS (${this.draftQuery.getContactsCTE()}),
      tags_agg AS (${this.draftQuery.getTagsCTE()})
    `;

    const rawQuery = Prisma.sql`
      ${subQueries}

      SELECT
        ${selectClause}
      FROM draft d
      ${joinClause}
      ${whereClause}
    `;

    const [draft] = await this.prisma.$queryRaw<Draft[]>(rawQuery);

    if (!draft) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.DRAFT_NOT_FOUND,
      );
    }

    return responseBuilder({
      message: SUCCESS_MSG.DRAFT_FETCHED,
      result: draft,
    });
  }

  // Check if a draft exists
  async draftExists(id: string) {
    const draft = await this.prisma.draft.findUnique({ where: { id } });

    if (!draft) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.DRAFT_NOT_FOUND,
      );
    }

    return draft;
  }
}

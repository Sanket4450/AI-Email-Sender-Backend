import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateDraftDto } from './dto/create-draft.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { Draft, Prisma } from '@prisma/client';

@Injectable()
export class DraftService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new draft
  async createDraft(body: CreateDraftDto) {
    const { contactIds, ...createDraftBody } = body;

    // Validate that all provided recipient IDs exist in the database
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

    // Create the draft and associate recipients
    await this.prisma.draft.create({
      data: {
        ...createDraftBody,
        recipients: contactIds
          ? {
              create: contactIds.map((contactId) => ({
                contact: { connect: { id: contactId } },
              })),
            }
          : undefined,
      },
    });

    return responseBuilder({
      message: SUCCESS_MSG.DRAFT_CREATED,
    });
  }

  // Update a draft by ID
  async updateDraft(id: string, body: UpdateDraftDto) {
    const { contactIds, ...updateDraftBody } = body;

    await this.draftExists(id);

    // Validate that all provided recipient IDs exist in the database
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

    // Update the draft and re-associate recipients
    await this.prisma.draft.update({
      where: { id },
      data: {
        ...updateDraftBody,
        ...(contactIds?.length && {
          recipients: {
            connectOrCreate: contactIds.map((contactId) => ({
              where: { draftId_contactId: { draftId: id, contactId } },
              create: { contact: { connect: { id: contactId } } },
            })),
          },
        }),
      },
    });

    return responseBuilder({
      message: SUCCESS_MSG.DRAFT_UPDATED,
    });
  }

  // Delete a draft by ID
  async deleteDraft(id: string) {
    await this.draftExists(id);

    await this.prisma.draftContact.deleteMany({ where: { draftId: id } });
    await this.prisma.draft.delete({ where: { id } });

    return responseBuilder({
      message: SUCCESS_MSG.DRAFT_DELETED,
    });
  }

  // Get all drafts
  async getDrafts() {
    const query = Prisma.sql`
      SELECT
        d.id AS id,
        d.subject AS subject,
        d."createdAt" AS "createdAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', c.id,
              'name', c.name
            )
          ) FILTER (WHERE c.id IS NOT NULL), '[]'::JSON
        )  AS recipients
      FROM draft d
      LEFT JOIN draft_contact dc ON d.id = dc."draftId"
      LEFT JOIN contact c ON dc."contactId" = c.id
      GROUP BY d.id
    `;

    const drafts = await this.prisma.$queryRaw<Draft[]>(query);

    return responseBuilder({
      message: SUCCESS_MSG.DRAFTS_FETCHED,
      result: drafts,
    });
  }

  // Get a draft by ID
  async getSingleDraft(id: string) {
    const query = Prisma.sql`
      SELECT
        d.id AS id,
        d.subject AS subject,
        d.body AS body,
        d."createdAt" AS "createdAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', c.id,
              'name', c.name
            )
          ) FILTER (WHERE c.id IS NOT NULL), '[]'::JSON
        )  AS recipients
      FROM draft d
      LEFT JOIN draft_contact dc ON d.id = dc."draftId"
      LEFT JOIN contact c ON dc."contactId" = c.id
      WHERE d.id = ${id}
      GROUP BY d.id
    `;

    const [draft] = await this.prisma.$queryRaw<Draft[]>(query);

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

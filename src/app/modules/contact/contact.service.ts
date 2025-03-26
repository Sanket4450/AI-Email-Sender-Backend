import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CompanyService } from '../company/company.service';
import { Contact, Prisma } from '@prisma/client';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { GetContactsDto } from './dto/get-contacts.dto';
import { getPagination, getSearchCond } from 'src/app/utils/common.utils';
import { QueryResponse } from 'src/app/types/common.type';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyService: CompanyService,
  ) {}

  // Create a new contact
  async createContact(body: CreateContactDto) {
    const { companyId, tags, ...createContactBody } = body;

    // Check if the email is already used
    const existingContact = await this.prisma.contact.findUnique({
      where: { email: body.email },
    });

    if (existingContact) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        ERROR_MSG.CONTACT_ALREADY_EXISTS,
      );
    }

    // Validate companyId if provided
    await this.companyService.companyExists(companyId);

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

    // Create the contact
    await this.prisma.contact.create({
      data: {
        ...createContactBody,
        ...(tags?.length && {
          contactTags: {
            create: tags.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
        company: { connect: { id: companyId } },
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.CONTACT_CREATED });
  }

  // Update a contact by ID
  async updateContact(id: string, body: UpdateContactDto) {
    const { companyId, tags, ...updateContactBody } = body;

    // Validate companyId if provided
    if (companyId) {
      await this.companyService.companyExists(companyId);
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

    // Update the contact
    await this.prisma.contact.update({
      where: { id },
      data: {
        ...updateContactBody,
        ...(tags?.length && {
          contactTags: {
            connectOrCreate: tags.map((tagId) => ({
              where: { contactId_tagId: { contactId: id, tagId } },
              create: { tag: { connect: { id: tagId } } },
            })),
          },
        }),
        ...(companyId && { company: { connect: { id: companyId } } }),
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.CONTACT_UPDATED });
  }

  // Delete a contact by ID
  async deleteContact(id: string) {
    await this.contactExists(id);

    await this.prisma.contact.delete({ where: { id } });

    return responseBuilder({ message: SUCCESS_MSG.CONTACT_DELETED });
  }

  // Get all contacts
  async getContacts(query: GetContactsDto) {
    const { search } = query;
    const { offset, limit } = getPagination(query);

    const conditions: Prisma.Sql[] = [];

    if (search) {
      const searchKeys = [
        'c.name',
        'c.position',
        'c.email',
        'c.location',
        'co.title',
        'co.description',
        'co.location',
        't.title',
      ];
      conditions.push(getSearchCond(search, searchKeys));
    }

    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;

    const joinClause = Prisma.sql`
      JOIN company co ON c."companyId" = co.id
      LEFT JOIN contact_tag ct ON c.id = ct."contactId"
      LEFT JOIN tag t ON ct."tagId" = t.id
    `;

    const rawQuery = Prisma.sql`
      WITH "ContactsCount" AS (
        SELECT
          COUNT(DISTINCT c.id)::INT AS "count"
        FROM contact c
        ${joinClause}
        ${whereClause}
      ),

      "ContactsData" AS (
        SELECT
          c.id AS id,
          c.name AS name,
          c.position AS position,
          c.email AS email,
          c."linkedInUrl" AS "linkedInUrl",
          c.location AS location,
          c."createdAt" AS "createdAt",

          JSON_BUILD_OBJECT(
            'id', co.id,
            'title', co.title,
            'description', co.description,
            'location', co.location,
            'createdAt', co."createdAt"
          ) AS company,

          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', t.id,
                'title', t.title
              )
            ) FILTER (WHERE t.id IS NOT NULL), '[]'::JSON
          )  AS tags

        FROM contact c
        ${joinClause}
        ${whereClause}
        GROUP BY c.id, co.id
        OFFSET ${offset}
        LIMIT ${limit}
      )
      
      SELECT
        (SELECT "count" FROM "ContactsCount") AS "count",
        COALESCE((SELECT JSON_AGG("ContactsData") FROM "ContactsData"), '[]'::JSON) AS "data"
      ;
    `;

    const [contactsResponse] = await this.prisma.$queryRaw<QueryResponse<Contact>>(rawQuery);

    return responseBuilder({
      message: SUCCESS_MSG.CONTACTS_FETCHED,
      result: contactsResponse,
    });
  }

  // Get a contact by ID
  async getSingleContact(id: string) {
    const rawQuery = Prisma.sql`
      SELECT
        c.id AS id,
        c.name AS name,
        c.position AS position,
        c.email AS email,
        c."linkedInUrl" AS "linkedInUrl",
        c.location AS location,
        c.status AS status,
        c."createdAt" AS "createdAt",

        JSON_BUILD_OBJECT(
          'id', co.id,
          'title', co.title,
          'description', co.description,
          'location', co.location,
          'createdAt', co."createdAt"
        ) AS company,

        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', t.id,
              'title', t.title
            )
          ) FILTER (WHERE t.id IS NOT NULL), '[]'::JSON
        )  AS tags

      FROM contact c
      JOIN company co ON c."companyId" = co.id
      LEFT JOIN contact_tag ct ON c.id = ct."contactId"
      LEFT JOIN tag t ON ct."tagId" = t.id
      WHERE c.id = ${id}
      GROUP BY c.id, co.id
    `;

    const [contact] = await this.prisma.$queryRaw<Contact[]>(rawQuery);

    if (!contact) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.CONTACT_NOT_FOUND,
      );
    }

    return responseBuilder({
      message: SUCCESS_MSG.CONTACT_FETCHED,
      result: contact,
    });
  }

  // Check if a contact exists
  async contactExists(id: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });

    if (!contact) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.CONTACT_NOT_FOUND,
      );
    }

    return contact;
  }
}

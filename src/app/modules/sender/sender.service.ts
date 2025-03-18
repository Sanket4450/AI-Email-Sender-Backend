import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateSenderDto } from './dto/create-sender.dto';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { UpdateSenderDto } from './dto/update-sender.dto';
import { CompanyService } from '../company/company.service';
import { Sender, Prisma } from '@prisma/client';
import { CustomHttpException } from 'src/app/exceptions/error.exception';

@Injectable()
export class SenderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyService: CompanyService,
  ) {}

  // Create a new contact
  async createSender(body: CreateSenderDto) {
    const { companyId, tags, ...createSenderBody } = body;

    // Check if the email is already used
    const existingSender = await this.prisma.contact.findUnique({
      where: { email: body.email },
    });

    if (existingSender) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        ERROR_MSG.COMPANY_ALREADY_EXISTS,
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
        ...createSenderBody,
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
  async updateSender(id: string, body: UpdateSenderDto) {
    const { companyId, tags, ...updateSenderBody } = body;

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
        ...updateSenderBody,
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
  async deleteSender(id: string) {
    await this.contactExists(id);

    return this.prisma.contact.delete({ where: { id } });
  }

  // Get all contacts
  async getSenders() {
    const query = Prisma.sql`
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
      GROUP BY c.id, co.id
    `;

    const contacts = await this.prisma.$queryRaw<Sender[]>(query);

    return responseBuilder({
      message: SUCCESS_MSG.CONTACTS_FETCHED,
      result: contacts,
    });
  }

  // Get a contact by ID
  async getSingleSender(id: string) {
    const query = Prisma.sql`
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

    const [contact] = await this.prisma.$queryRaw<Sender[]>(query);

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
        ERROR_MSG.COMPANY_NOT_FOUND,
      );
    }

    return contact;
  }
}

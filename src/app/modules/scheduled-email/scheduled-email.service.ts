import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateScheduledEmailDto } from './dto/create-scheduled-email.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { UpdateScheduledEmailDto } from './dto/update-scheduled-email.dto';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { ScheduledEmail, Prisma } from '@prisma/client';
import { SenderService } from '../sender/sender.service';
import { GetScheduledEmailsDto } from './dto/get-scheduled-emails.dto';
import { getPagination, getSearchCond } from 'src/app/utils/common.utils';

@Injectable()
export class ScheduledEmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly senderService: SenderService,
  ) {}

  // Create a new scheduledEmail
  async createScheduledEmail(body: CreateScheduledEmailDto) {
    const { senderId, contactIds, ...createScheduledEmailBody } = body;

    // Validate that the sender exists
    await this.senderService.senderExists(senderId);

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

    // Create the scheduledEmail and associate contacts
    await this.prisma.scheduledEmail.create({
      data: {
        ...createScheduledEmailBody,
        sender: { connect: { id: senderId } },
        emailContacts: contactIds
          ? {
              create: contactIds.map((contactId) => ({
                contact: { connect: { id: contactId } },
              })),
            }
          : undefined,
      },
    });

    return responseBuilder({
      message: SUCCESS_MSG.EMAIL_CREATED,
    });
  }

  // Update a scheduledEmail by ID
  async updateScheduledEmail(id: string, body: UpdateScheduledEmailDto) {
    const { senderId, contactIds, ...updateScheduledEmailBody } = body;

    await this.scheduledEmailExists(id);

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

    // Update the scheduledEmail and re-associate contacts
    await this.prisma.scheduledEmail.update({
      where: { id },
      data: {
        ...updateScheduledEmailBody,
        ...(senderId && { sender: { connect: { id: senderId } } }),
        ...(contactIds?.length && {
          emailContacts: {
            connectOrCreate: contactIds.map((contactId) => ({
              where: {
                emailId_contactId: { emailId: id, contactId },
              },
              create: { contact: { connect: { id: contactId } } },
            })),
          },
        }),
      },
    });

    return responseBuilder({
      message: SUCCESS_MSG.EMAIL_UPDATED,
    });
  }

  // Delete a scheduledEmail by ID
  async deleteScheduledEmail(id: string) {
    await this.scheduledEmailExists(id);

    await this.prisma.scheduledEmailContact.deleteMany({
      where: { emailId: id },
    });

    await this.prisma.scheduledEmail.delete({ where: { id } });

    return responseBuilder({
      message: SUCCESS_MSG.EMAIL_DELETED,
    });
  }

  // Get all scheduledEmails
  async getScheduledEmails(query: GetScheduledEmailsDto) {
    const { search, contactIds = [], senderId } = query;
    const { offset, limit } = getPagination(query);

    const conditions: Prisma.Sql[] = [];

    if (contactIds.length) {
      conditions.push(Prisma.sql`c.id IN (${Prisma.join(contactIds)})`);
    }
    if (senderId) {
      conditions.push(Prisma.sql`s.id = ${senderId}`);
    }
    if (search) {
      const searchKeys = ['e.subject', 'c.name', 's.name'];
      conditions.push(getSearchCond(search, searchKeys));
    }

    const whereClause = conditions.length
      ? Prisma.sql`${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;

    const rawQuery = Prisma.sql`
      SELECT
        e.id AS id,
        e.subject AS subject,
        e."scheduledAt" AS "scheduledAt",
        e."createdAt" AS "createdAt",
        JSON_BUILD_OBJECT(
          'id', s.id,
          'displayName', s."displayName"
        ) AS sender,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', c.id,
              'name', c.name
            )
          ) FILTER (WHERE c.id IS NOT NULL), '[]'::JSON
        )  AS contacts
      FROM scheduled_email e
      JOIN sender s ON s.id = e."senderId"
      LEFT JOIN scheduled_email_contact dc ON e.id = dc."emailId"
      LEFT JOIN contact c ON dc."contactId" = c.id
      ${whereClause.sql.trim().length ? Prisma.sql`WHERE ${whereClause}` : Prisma.empty}
      GROUP BY e.id, s.id
      OFFSET ${offset}
      LIMIT ${limit};
    `;

    const scheduledEmails =
      await this.prisma.$queryRaw<ScheduledEmail[]>(rawQuery);

    return responseBuilder({
      message: SUCCESS_MSG.EMAILS_FETCHED,
      result: scheduledEmails,
    });
  }

  // Get a scheduledEmail by ID
  async getSingleScheduledEmail(id: string) {
    const rawQuery = Prisma.sql`
      SELECT
        e.id AS id,
        e.subject AS subject,
        e.body AS body,
        e."scheduledAt" AS "scheduledAt",
        e."createdAt" AS "createdAt",
        JSON_BUILD_OBJECT(
          'id', s.id,
          'displayName', s."displayName"
        ) AS sender,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', c.id,
              'name', c.name,
              'position', c.position,
              'email', c.email,
              'phone', c.phone,
              'linkedInUrl', c."linkedInUrl",
              'location', c.location
            )
          ) FILTER (WHERE c.id IS NOT NULL), '[]'::JSON
        ) AS contacts
      FROM scheduled_email e
      JOIN sender s ON s.id = e."senderId"
      LEFT JOIN scheduled_email_contact dc ON e.id = dc."emailId"
      LEFT JOIN contact c ON dc."contactId" = c.id
      WHERE e.id = ${id}
      GROUP BY e.id, s.id;
    `;

    const [scheduledEmail] =
      await this.prisma.$queryRaw<ScheduledEmail[]>(rawQuery);

    if (!scheduledEmail) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.EMAIL_NOT_FOUND,
      );
    }

    return responseBuilder({
      message: SUCCESS_MSG.EMAIL_FETCHED,
      result: scheduledEmail,
    });
  }

  // Check if a scheduledEmail exists
  async scheduledEmailExists(id: string) {
    const scheduledEmail = await this.prisma.scheduledEmail.findUnique({
      where: { id },
    });

    if (!scheduledEmail) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.EMAIL_NOT_FOUND,
      );
    }

    return scheduledEmail;
  }
}

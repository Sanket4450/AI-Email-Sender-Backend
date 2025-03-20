import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateScheduledEmailDto } from './dto/create-scheduled-email.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { UpdateScheduledEmailDto } from './dto/update-scheduled-email.dto';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { ScheduledEmail, Prisma } from '@prisma/client';
import { SenderService } from '../sender/sender.service';

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
        scheduledEmailContacts: contactIds
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
    if (senderId) await this.senderService.senderExists(id);

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
          contacts: {
            connectOrCreate: contactIds.map((contactId) => ({
              where: {
                scheduledEmailId_contactId: { scheduledEmailId: id, contactId },
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
  async getScheduledEmails() {
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
        )  AS contacts
      FROM scheduledEmail d
      LEFT JOIN scheduledEmail_contact dc ON d.id = dc."scheduledEmailId"
      LEFT JOIN contact c ON dc."contactId" = c.id
      GROUP BY d.id
    `;

    const scheduledEmails =
      await this.prisma.$queryRaw<ScheduledEmail[]>(query);

    return responseBuilder({
      message: SUCCESS_MSG.EMAILS_FETCHED,
      result: scheduledEmails,
    });
  }

  // Get a scheduledEmail by ID
  async getSingleScheduledEmail(id: string) {
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
        )  AS contacts
      FROM scheduledEmail d
      LEFT JOIN scheduledEmail_contact dc ON d.id = dc."scheduledEmailId"
      LEFT JOIN contact c ON dc."contactId" = c.id
      WHERE d.id = ${id}
      GROUP BY d.id
    `;

    const [scheduledEmail] =
      await this.prisma.$queryRaw<ScheduledEmail[]>(query);

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

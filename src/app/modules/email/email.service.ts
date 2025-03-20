import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { SenderService } from '../sender/sender.service';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { Email, Prisma } from '@prisma/client';
import { GetEmailsDto } from './dto/get-emails.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly senderService: SenderService,
  ) {}

  // Create a new email
  async createEmail(body: CreateEmailDto) {
    const { senderId, contactIds, ...createEmailBody } = body;

    // Validate that the sender exists
    await this.senderService.senderExists(senderId);

    // Validate that the contact exists
    const contacts = await this.prisma.contact.findMany({
      where: { id: { in: contactIds } },
    });

    if (contacts.length !== contactIds.length) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        ERROR_MSG.ONE_OR_MORE_CONTACTS_NOT_FOUND,
      );
    }

    const createData: Prisma.EmailCreateManyInput[] = contacts.map((c) => ({
      ...createEmailBody,
      contactId: c.id,
      senderId,
    }));

    await this.prisma.email.createMany({
      data: createData,
    });

    return responseBuilder({
      message: SUCCESS_MSG.EMAIL_CREATED,
    });
  }

  // Get all emails
  async getEmails(query: GetEmailsDto) {
    const sql = Prisma.sql`
        SELECT
          e.id AS id,
          e.subject AS subject,
          e."isBounced" AS isBounced,
          e."isSpamReported" AS isSpamReported,
          e."createdAt" AS "createdAt",
          JSON_BUILD_OBJECT(
            'id', s.id,
            'displayName', s."displayName"
          ) AS sender,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', ev.id,
                'eventType', ev."eventType"
              )
            ) FILTER (WHERE ev.id IS NOT NULL), '[]'::JSON
          )  AS events
        FROM email e
        JOIN sender s ON s.id = e."senderId"
        LEFT JOIN email_event ev ON ev."emailId" = e.id
        GROUP BY e.id, s.id;
      `;

    const emails = await this.prisma.$queryRaw<Email[]>(sql);

    return responseBuilder({
      message: SUCCESS_MSG.EMAILS_FETCHED,
      result: emails,
    });
  }

  // Get a email by ID
  async getSingleEmail(id: string) {
    const query = Prisma.sql`
        SELECT
          e.id AS id,
          e.subject AS subject,
          e.body AS body,
          e."isBounced" AS isBounced,
          e."isSpamReported" AS isSpamReported,
          e."createdAt" AS "createdAt",
          JSON_BUILD_OBJECT(
            'id', s.id,
            'displayName', s."displayName"
          ) AS sender,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', ev.id,
                'eventType', ev."eventType"
              )
            ) FILTER (WHERE ev.id IS NOT NULL), '[]'::JSON
          )  AS events
        FROM email e
        JOIN sender s ON s.id = e."senderId"
        LEFT JOIN email_event ev ON ev."emailId" = e.id
        WHERE e.id = ${id}
        GROUP BY e.id, s.id;
      `;

    const [email] = await this.prisma.$queryRaw<Email[]>(query);

    if (!email) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.EMAIL_NOT_FOUND,
      );
    }

    return responseBuilder({
      message: SUCCESS_MSG.EMAIL_FETCHED,
      result: email,
    });
  }

  // Check if a email exists
  async emailExists(id: string) {
    const email = await this.prisma.email.findUnique({ where: { id } });

    if (!email) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.EMAIL_NOT_FOUND,
      );
    }

    return email;
  }
}

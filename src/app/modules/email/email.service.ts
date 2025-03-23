import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ERROR_MSG, SUCCESS_MSG, VALIDATION_MSG } from 'src/app/utils/messages';
import { SenderService } from '../sender/sender.service';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { Email, Prisma } from '@prisma/client';
import { GetEmailsDto } from './dto/get-emails.dto';
import { getPagination, getSearchCond } from 'src/app/utils/common.utils';
import { ESPService } from '../esp/esp.service';
import {
  EMAIL_BOUNCE_EVENTS,
  EMAIL_EVENTS,
  EMAIL_SPAM_REPORT_EVENTS,
  EMAIL_TYPES,
  VALUES,
} from 'src/app/utils/constants';

@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly senderService: SenderService,
    private readonly espService: ESPService,
  ) {}

  // Create a new email
  async createEmail(body: CreateEmailDto) {
    const { senderId, contactIds, ...createEmailBody } = body;

    // Validate that the sender exists
    const sender = await this.senderService.senderExists(senderId);

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

    const createdEmails = await this.prisma.email.createManyAndReturn({
      data: contacts.map((c) => ({
        ...createEmailBody,
        contactId: c.id,
        senderId,
      })),
    });

    await this.espService.sendEmails({
      emails: contacts.map((contact, idx) => ({
        ...createEmailBody,
        referenceId: createdEmails[idx].id,
        contact,
      })),
      sender,
    });

    return responseBuilder({
      message: SUCCESS_MSG.EMAIL_CREATED,
    });
  }

  // Get all emails
  async getEmails(query: GetEmailsDto) {
    const {
      search,
      contactIds = [],
      senderId,
      isBounced = false,
      isSpamReported = false,
      eventTypes = [],
      isDeepSearch = false,
    } = query;
    const { offset, limit } = getPagination(query);

    const conditions: Prisma.Sql[] = [];

    if (contactIds.length) {
      conditions.push(Prisma.sql`c.id IN (${Prisma.join(contactIds)})`);
    }
    if (senderId) {
      conditions.push(Prisma.sql`s.id = ${senderId}`);
    }
    if (isBounced) {
      conditions.push(Prisma.sql`e."isBounced" = ${isBounced}`);
    }
    if (isSpamReported) {
      conditions.push(Prisma.sql`e."isSpamReported" = ${isSpamReported}`);
    }
    if (eventTypes.length) {
      conditions.push(
        Prisma.sql`ev."eventType" IN (${Prisma.join(eventTypes)})`,
      );
    }
    if (search) {
      const searchKeys = [
        'e.subject',
        'c.name',
        's.name',
        ...(isDeepSearch ? ['e.body'] : []),
      ];
      conditions.push(getSearchCond(search, searchKeys));
    }

    const whereClause = conditions.length
      ? Prisma.sql`${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;

    const rawQuery = Prisma.sql`
        SELECT
          e.id AS id,
          e.subject AS subject,
          e."isBounced" AS "isBounced",
          e."isSpamReported" AS "isSpamReported",
          e."createdAt" AS "createdAt",
          JSON_BUILD_OBJECT(
            'id', c.id,
            'name', c."name"
          ) AS contact,
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
        JOIN contact c ON c.id = e."contactId"
        JOIN sender s ON s.id = e."senderId"
        LEFT JOIN email_event ev ON ev."emailId" = e.id
        ${whereClause.sql.trim().length ? Prisma.sql`WHERE ${whereClause}` : Prisma.empty}
        GROUP BY e.id, c.id, s.id
        ORDER BY e."createdAt" DESC
        OFFSET ${offset}
        LIMIT ${limit};
      `;

    const emails = await this.prisma.$queryRaw<Email[]>(rawQuery);

    return responseBuilder({
      message: SUCCESS_MSG.EMAILS_FETCHED,
      result: emails,
    });
  }

  // Get a email by ID
  async getSingleEmail(id: string) {
    const rawQuery = Prisma.sql`
        SELECT
          e.id AS id,
          e.subject AS subject,
          e.body AS body,
          e."isBounced" AS isBounced,
          e."isSpamReported" AS isSpamReported,
          e."createdAt" AS "createdAt",
          JSON_BUILD_OBJECT(
            'id', c.id,
            'name', c."name",
            'position', c.position,
            'email', c.email,
            'phone', c.phone,
            'linkedInUrl', c."linkedInUrl",
            'location', c.location
          ) AS contact,
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
        JOIN contact c ON c.id = e."contactId"
        JOIN sender s ON s.id = e."senderId"
        LEFT JOIN email_event ev ON ev."emailId" = e.id
        WHERE e.id = ${id}
        GROUP BY e.id, c.id, s.id;
      `;

    const [email] = await this.prisma.$queryRaw<Email[]>(rawQuery);

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

  async handleEmailEventWebhook(headers: any, body: any[]) {
    try {
      if (headers['user-agent'] !== VALUES.SENDGRID_USER_AGENT) {
        throw new CustomHttpException(
          HttpStatus.FORBIDDEN,
          ERROR_MSG.INVALID_USER_AGENT,
        );
      }

      const emailData = [];
      const followUpData = [];

      for (let obj of body) {
        if (obj.event && obj.referenceId) {
          const isBounced = EMAIL_BOUNCE_EVENTS.includes(obj.event);
          const isSpamReported = EMAIL_SPAM_REPORT_EVENTS.includes(obj.event);

          if (obj.type === EMAIL_TYPES.FOLLOW_UP) {
            const followUpEvents = [];

            if (!isBounced && !isSpamReported) {
              const eventField = EMAIL_EVENTS[obj.event];

              if (eventField) {
                followUpEvents.push({
                  eventType: eventField,
                  createdAt: new Date(obj.timestamp),
                });
              }
            }

            const existingFollowUp = followUpData.find(
              (e) => e.id === obj.referenceId,
            );

            if (existingFollowUp) {
              const existingFollowUpIndex = followUpData.findIndex(
                (ed) => ed.id === existingFollowUp.id,
              );

              followUpData[existingFollowUpIndex] = {
                ...existingFollowUp,
                email: {
                  ...existingFollowUp.email,
                  ...(isBounced && { isBounced }),
                  ...(isSpamReported && { isSpamReported }),
                },
                followUpEvents: [
                  ...existingFollowUp.followUpEvents,
                  ...followUpEvents,
                ],
              };
            } else {
              followUpData.push({
                id: obj.referenceId,
                senderId: obj.senderId,
                followUp: {
                  ...(isBounced && { isBounced }),
                  ...(isSpamReported && { isSpamReported }),
                },
                followUpEvents,
              });
            }
          } else {
            const emailEvents = [];

            if (!isBounced && !isSpamReported) {
              const eventField = EMAIL_EVENTS[obj.event];

              if (eventField) {
                emailEvents.push({
                  eventType: eventField,
                  createdAt: new Date(obj.timestamp),
                });
              }
            }

            const existingEmail = emailData.find(
              (e) => e.id === obj.referenceId,
            );

            if (existingEmail) {
              const existingEmailIndex = emailData.findIndex(
                (ed) => ed.id === existingEmail.id,
              );

              emailData[existingEmailIndex] = {
                ...existingEmail,
                email: {
                  ...existingEmail.email,
                  ...(isBounced && { isBounced }),
                  ...(isSpamReported && { isSpamReported }),
                },
                emailEvents: [...existingEmail.emailEvents, ...emailEvents],
              };
            } else {
              emailData.push({
                id: obj.referenceId,
                senderId: obj.senderId,
                email: {
                  messageId: obj['smtp-id'] || obj.sg_message_id || null,
                  ...(isBounced && { isBounced }),
                  ...(isSpamReported && { isSpamReported }),
                },
                emailEvents,
              });
            }
          }
        }
      }

      if (emailData.length) {
        for (let ed of emailData) {
          await this.prisma.email.update({
            where: { id: ed.id },
            data: {
              ...ed.email,
              events: {
                createMany: { data: ed.emailEvents },
              },
            },
          });

          if (
            ed.emailEvents.some(
              (ee: any) => ee.eventType === EMAIL_EVENTS.DELIVERED,
            )
          ) {
            const rawQuery = Prisma.sql`
              UPDATE sender
              SET "sentCount" = "sentCount" + 1
              WHERE id = ${ed.senderId};
            `;

            await this.prisma.$executeRaw(rawQuery);
          }
        }
      }

      if (followUpData.length) {
        if (followUpData.length) {
          for (let fud of followUpData) {
            await this.prisma.email.update({
              where: { id: fud.id },
              data: {
                ...fud.email,
                events: {
                  createMany: {
                    data: fud.emailEvents,
                  },
                },
              },
            });

            if (
              fud.emailEvents.some(
                (ee: any) => ee.eventType === EMAIL_EVENTS.DELIVERED,
              )
            ) {
              const rawQuery = Prisma.sql`
              UPDATE sender
              SET "sentCount" = "sentCount" + 1
              WHERE id = ${fud.senderId};
            `;

              await this.prisma.$executeRaw(rawQuery);
            }
          }
        }
      }

      return responseBuilder({ message: SUCCESS_MSG.EMAIL_EVENT_HANDLED });
    } catch (error) {
      console.log({
        statusCode: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  // Check if a email exists
  async emailExists(id: string, include?: Prisma.EmailInclude) {
    const email = await this.prisma.email.findUnique({
      where: { id },
      ...(include && { include }),
    });

    if (!email) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.EMAIL_NOT_FOUND,
      );
    }

    return email;
  }
}

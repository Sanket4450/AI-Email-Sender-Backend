import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { SenderService } from '../sender/sender.service';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { GetEmailsDto } from './dto/get-emails.dto';
import { getPagination, getSearchCond } from 'src/app/utils/common.utils';
import { ESPService } from '../esp/esp.service';
import {
  EMAIL_BOUNCE_EVENTS,
  EMAIL_EVENTS,
  EMAIL_SPAM_REPORT_EVENTS,
  EMAIL_TYPES,
  ESPS,
  VALUES,
} from 'src/app/utils/constants';
import { QueryResponse } from 'src/app/types/common.type';
import { EmailQuery } from './email.query';
import { TagService } from '../tag/tag.service';
import { Email, Prisma } from 'prisma/generated';
import { LogService } from '../log/log.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly senderService: SenderService,
    private readonly espService: ESPService,
    private readonly tagService: TagService,
    private readonly logService: LogService,
    private readonly emailQuery: EmailQuery,
  ) {}

  // Create a new email
  async createEmail(body: CreateEmailDto) {
    const { senderId, contactIds, tags, ...createEmailBody } = body;

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

    // Validate tags if provided
    if (tags?.length) await this.tagService.validateTags(tags);

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
      ...(tags?.length && {
        emailTags: {
          create: tags.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      }),
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
        Prisma.sql`ev."eventType"::TEXT IN (${Prisma.join(eventTypes)})`,
      );
    }
    if (search) {
      const searchKeys = [
        'e.subject',
        'c.name',
        ...(isDeepSearch ? ['e.body'] : []),
      ];
      conditions.push(getSearchCond(search, searchKeys));
    }

    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;

    const selectClause = this.emailQuery.getEmailSelectFields();

    const joinClause = this.emailQuery.getJoinClause();

    const groupByClause = this.emailQuery.getGroupByClause();

    const rawQuery = Prisma.sql`
      WITH "EmailCount" AS (
        SELECT
          COUNT(DISTINCT e.id)::INT AS "count"
        FROM email e
        ${joinClause}
        ${whereClause}
      ),

      "EmailsData" AS (
        SELECT
          ${selectClause}
        FROM email e
        ${joinClause}
        ${whereClause}
        ${groupByClause}
        ORDER BY e."createdAt" DESC
        OFFSET ${offset}
        LIMIT ${limit}
      )
      
      SELECT
        (SELECT "count" FROM "EmailCount") AS "count",
        COALESCE((SELECT JSON_AGG("EmailsData") FROM "EmailsData"), '[]'::JSON) AS "data";
    `;

    const [emailsResponse] =
      await this.prisma.$queryRaw<QueryResponse<Email>>(rawQuery);

    return responseBuilder({
      message: SUCCESS_MSG.EMAILS_FETCHED,
      result: emailsResponse,
    });
  }

  // Get a email by ID
  async getSingleEmail(id: string) {
    const selectClause = this.emailQuery.getEmailSelectFields(true);

    const joinClause = this.emailQuery.getJoinClause();

    const groupByClause = this.emailQuery.getGroupByClause();

    const rawQuery = Prisma.sql`
      SELECT
        ${selectClause}
      FROM email e
      ${joinClause}
      WHERE e.id = ${id}
      ${groupByClause};
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

      await this.logService.createWebhookLog({
        platform: ESPS.SENDGRID,
        body: JSON.stringify(body),
      });

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
                followUp: {
                  ...existingFollowUp.followUp,
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
        for (let fud of followUpData) {
          await this.prisma.followUp.update({
            where: { id: fud.id },
            data: {
              ...fud.followUp,
              events: {
                createMany: {
                  data: fud.followUpEvents,
                },
              },
            },
          });

          if (
            fud.followUpEvents.some(
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

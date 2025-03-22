import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { GetFollowUpsDto } from './dto/get-follow-up.dto';
import { EmailService } from '../email/email.service';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { FollowUp, Prisma } from '@prisma/client';
import { ESPService } from '../esp/esp.service';

@Injectable()
export class FollowUpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly espService: ESPService,
  ) {}

  // Create a new follow-up
  async createFollowUp(body: CreateFollowUpDto) {
    const { emailId, ...createFollowUpData } = body;

    await this.emailService.emailExists(emailId);

    await this.prisma.followUp.create({
      data: {
        ...createFollowUpData,
        email: { connect: { id: emailId } },
      },
    });

    return responseBuilder({
      message: SUCCESS_MSG.FOLLOW_UP_CREATED,
    });
  }

  // Update a follow-up by ID
  async updateFollowUp(id: string, body: UpdateFollowUpDto) {
    const { emailId, ...updateFollowUpData } = body;

    await this.followUpExists(id);

    if (emailId) await this.emailService.emailExists(emailId);

    await this.prisma.followUp.update({
      where: { id },
      data: {
        ...updateFollowUpData,
        ...(emailId && { email: { connect: { id: emailId } } }),
      },
    });

    return responseBuilder({
      message: SUCCESS_MSG.FOLLOW_UP_UPDATED,
    });
  }

  // Delete a follow-up by ID
  async deleteFollowUp(id: string) {
    await this.followUpExists(id);

    return this.prisma.followUp.delete({ where: { id } });
  }

  // Get all follow-ups with filters
  async getFollowUps(query: GetFollowUpsDto) {
    const { emailId, search } = query;

    await this.emailService.emailExists(emailId);

    const searchKeyword = `'%${search}%'`;

    const searchKeys = ['fu.subject'];

    const searchWhere = search
      ? searchKeys.map((key) => `${key} ILIKE ${searchKeyword}`).join(' OR ')
      : Prisma.empty;

    const conditions: Prisma.Sql[] = [];

    if (emailId) {
      conditions.push(Prisma.sql`fu.id = ${emailId}`);
    }
    if (search) {
      conditions.push(Prisma.sql`(${searchWhere})`);
    }

    const whereClause = conditions.length
      ? Prisma.sql`${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;

    const rawQuery = Prisma.sql`
      SELECT
        fu.id AS id,
        fu.subject AS subject,
        fu.body AS body,
        fu."scheduledAt" AS "scheduledAt",
        fu."isBounced" AS "isBounced",
        fu."isSpamReported" AS "isSpamReported",
        fu."createdAt" AS "createdAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', fuev.id,
              'eventType', fuev."eventType"
            )
          ) FILTER (WHERE fuev.id IS NOT NULL), '[]'::JSON
        )  AS events
      FROM follow_up fu
      JOIN email e ON fu."emailId" = e.id
      LEFT JOIN follow_up_event fuev ON fuev."followUpId" = fu.id
      ${Prisma.sql`WHERE ${whereClause}`}
      GROUP BY fu.id, e.id;
    `;

    const followUp = await this.prisma.$queryRaw<FollowUp[]>(rawQuery);

    return responseBuilder({
      message: SUCCESS_MSG.EMAILS_FETCHED,
      result: followUp,
    });
  }

  // Check if a follow up exists
  async followUpExists(id: string) {
    const followUp = await this.prisma.followUp.findUnique({
      where: { id, scheduledAt: { not: null } },
    });

    if (!followUp) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.FOLLOW_UP_NOT_FOUND,
      );
    }

    return followUp;
  }
}

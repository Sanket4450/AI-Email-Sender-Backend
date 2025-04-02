import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateSenderDto } from './dto/create-sender.dto';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { UpdateSenderDto } from './dto/update-sender.dto';
import { Sender, Prisma } from '@prisma/client';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { CryptoService } from '../crypto/crypto.service';
import { ESPS } from 'src/app/utils/constants';
import { GetSendersDto } from './dto/get-senders.dto';
import { QueryResponse } from 'src/app/types/common.type';
import { SenderQuery } from './sender.query';
import { getSearchCond } from 'src/app/utils/common.utils';

@Injectable()
export class SenderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly senderQuery: SenderQuery,
  ) {}

  // Create a new sender
  async createSender(body: CreateSenderDto) {
    // Validate ESP
    await this.validateESP(body.esp);

    // Check if the name is already used with the same ESP
    const existingSender = await this.prisma.sender.findFirst({
      where: {
        name: { equals: body.name, mode: 'insensitive' },
        esp: body.esp,
        isDeleted: false,
      },
    });

    if (existingSender) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        ERROR_MSG.SENDER_ALREADY_EXISTS,
      );
    }

    // Encrypting the API KEY
    const apiKey = this.cryptoService.encrypt(body.apiKey);

    // Create the sender
    await this.prisma.sender.create({
      data: {
        ...body,
        apiKey,
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.SENDER_CREATED });
  }

  // Update a sender by ID
  async updateSender(id: string, body: UpdateSenderDto) {
    // Check if the sender exists
    const sender = await this.senderExists(id);

    // Validate ESP if provided
    if (body.esp) await this.validateESP(body.esp);

    // Check if the name is already used with the same ESP
    if (body.name) {
      const existingSender = await this.prisma.sender.findFirst({
        where: {
          name: { equals: body.name, mode: 'insensitive' },
          esp: sender.esp,
          id: { not: id },
          isDeleted: false,
        },
      });

      if (existingSender) {
        throw new CustomHttpException(
          HttpStatus.CONFLICT,
          ERROR_MSG.SENDER_ALREADY_EXISTS,
        );
      }
    }

    // Encrypting the API KEY
    const apiKey = body.apiKey ? this.cryptoService.encrypt(body.apiKey) : null;

    // Create the sender
    await this.prisma.sender.update({
      where: { id },
      data: {
        ...body,
        ...(apiKey && { apiKey }),
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.SENDER_UPDATED });
  }

  // Delete a sender by ID
  async deleteSender(id: string) {
    await this.senderExists(id);

    await this.prisma.sender.update({
      where: { id },
      data: { isDeleted: true },
    });

    return responseBuilder({ message: SUCCESS_MSG.SENDER_DELETED });
  }

  // Get all senders
  async getSenders(query: GetSendersDto) {
    const { search } = query;

    const conditions: Prisma.Sql[] = [];

    if (search) {
      const searchKeys = ['s."displayName"'];
      conditions.push(getSearchCond(search, searchKeys));
    }

    conditions.push(Prisma.sql`s."isDeleted" = false`);

    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;

    const rawQuery = Prisma.sql`
      WITH "SendersCount" AS (
        SELECT
          COUNT(s.id)::INT AS "count"
        FROM sender s
        ${whereClause}
      ),

      "SendersData" AS (
        SELECT
          ${this.senderQuery.getSenderSelectFields()}
        FROM sender s
        ${whereClause}
        ORDER BY s.priority ASC, s."createdAt" ASC
      )

      SELECT
        (SELECT "count" FROM "SendersCount") AS "count",
        COALESCE((SELECT JSON_AGG("SendersData") FROM "SendersData"), '[]'::JSON) AS "data";
    `;

    const [sendersResponse] =
      await this.prisma.$queryRaw<QueryResponse<Sender>>(rawQuery);

    return responseBuilder({
      message: SUCCESS_MSG.SENDERS_FETCHED,
      result: sendersResponse,
    });
  }

  // Get a sender by ID
  async getSingleSender(id: string) {
    const whereClause = Prisma.sql`WHERE s.id = ${id} AND s."isDeleted" = false`;

    const rawQuery = Prisma.sql`
      SELECT
        ${this.senderQuery.getSenderSelectFields(true)}
      ORDER BY s."displayName" DESC
      FROM sender s
      ${whereClause}
    `;

    const [sender] = await this.prisma.$queryRaw<Sender[]>(rawQuery);

    if (!sender) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.SENDER_NOT_FOUND,
      );
    }

    return responseBuilder({
      message: SUCCESS_MSG.SENDER_FETCHED,
      result: sender,
    });
  }

  // Check if a sender exists
  async senderExists(id: string) {
    const sender = await this.prisma.sender.findUnique({
      where: { id, isDeleted: false },
    });

    if (!sender) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.SENDER_NOT_FOUND,
      );
    }

    return sender;
  }

  // Validate ESP
  async validateESP(esp: string) {
    if (!Object.values(ESPS).includes(esp)) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.ESP_NOT_FOUND,
      );
    }
  }
}

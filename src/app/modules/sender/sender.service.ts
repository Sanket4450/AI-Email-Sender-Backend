import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateSenderDto } from './dto/create-sender.dto';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { UpdateSenderDto } from './dto/update-sender.dto';
import { Sender, Prisma } from '@prisma/client';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { ESPService } from '../esp/esp.service';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class SenderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly espService: ESPService,
    private readonly cryptoService: CryptoService,
  ) {}

  // Create a new sender
  async createSender(body: CreateSenderDto) {
    const { espId, ...createSenderBody } = body;

    await this.espService.espExists(espId);

    // Check if the name is already used with the same ESP
    const existingSender = await this.prisma.sender.findFirst({
      where: {
        name: { equals: createSenderBody.name, mode: 'insensitive' },
        espId,
      },
    });

    if (existingSender) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        ERROR_MSG.SENDER_ALREADY_EXISTS,
      );
    }

    // Encrypting the API KEY
    const apiKey = this.cryptoService.encrypt(createSenderBody.apiKey);

    // Create the sender
    await this.prisma.sender.create({
      data: {
        ...createSenderBody,
        apiKey,
        esp: { connect: { id: espId } },
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.SENDER_CREATED });
  }

  // Update a sender by ID
  async updateSender(id: string, body: UpdateSenderDto) {
    const { ...updateSenderBody } = body;

    // Check if the sender exists
    const sender = await this.senderExists(id);

    // Check if the name is already used with the same ESP
    if (updateSenderBody.name) {
      const existingSender = await this.prisma.sender.findFirst({
        where: {
          name: { equals: updateSenderBody.name, mode: 'insensitive' },
          espId: sender.espId,
          id: { not: id },
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
    const apiKey = updateSenderBody.apiKey
      ? this.cryptoService.encrypt(updateSenderBody.apiKey)
      : null;

    // Create the sender
    await this.prisma.sender.update({
      where: { id },
      data: {
        ...updateSenderBody,
        ...(apiKey && { apiKey }),
      },
    });

    return responseBuilder({ message: SUCCESS_MSG.SENDER_UPDATED });
  }

  // Delete a sender by ID
  async deleteSender(id: string) {
    await this.senderExists(id);

    await this.prisma.sender.delete({ where: { id } });

    return responseBuilder({ message: SUCCESS_MSG.SENDER_DELETED });
  }

  // Get all senders
  async getSenders() {
    const query = Prisma.sql`
      SELECT
        s.id AS id,
        s."displayName" AS "displayName",
        s.name AS name,
        s.priority AS priority,
        s.target AS target,
        s."sentCount" AS "sentCount",
        s."createdAt" AS "createdAt",

        JSON_BUILD_OBJECT(
          'id', esp.id,
          'title', esp.title
        ) AS esp

      FROM sender s
      JOIN esp esp ON s."espId" = esp.id
      GROUP BY s.id, esp.id
      ORDER BY s.priority ASC, s."createdAt" ASC
    `;

    const senders = await this.prisma.$queryRaw<Sender[]>(query);

    return responseBuilder({
      message: SUCCESS_MSG.SENDERS_FETCHED,
      result: senders,
    });
  }

  // Get a sender by ID
  async getSingleSender(id: string) {
    const query = Prisma.sql`
      SELECT
        s.id AS id,
        s."displayName" AS "displayName",
        s.name AS name,
        s.priority AS priority,
        s.target AS target,
        s."sentCount" AS "sentCount",
        s."createdAt" AS "createdAt",

        JSON_BUILD_OBJECT(
          'id', esp.id,
          'title', esp.title
        ) AS esp

      FROM sender s
      JOIN esp esp ON s."espId" = esp.id
      WHERE s.id = ${id}
      GROUP BY s.id, esp.id
      ORDER BY s.priority ASC, s."createdAt" ASC
    `;

    const [sender] = await this.prisma.$queryRaw<Sender[]>(query);

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
    const sender = await this.prisma.sender.findUnique({ where: { id } });

    if (!sender) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.SENDER_NOT_FOUND,
      );
    }

    return sender;
  }
}

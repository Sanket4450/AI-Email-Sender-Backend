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

@Injectable()
export class SenderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  // Create a new sender
  async createSender(body: CreateSenderDto) {
    await this.validateESP(body.esp);

    // Check if the name is already used with the same ESP
    const existingSender = await this.prisma.sender.findFirst({
      where: {
        name: { equals: body.name, mode: 'insensitive' },
        esp: body.esp,
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

    // Check if the name is already used with the same ESP
    if (body.name) {
      const existingSender = await this.prisma.sender.findFirst({
        where: {
          name: { equals: body.name, mode: 'insensitive' },
          esp: sender.esp,
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

    await this.prisma.sender.delete({ where: { id } });

    return responseBuilder({ message: SUCCESS_MSG.SENDER_DELETED });
  }

  // Get all senders
  async getSenders(query: GetSendersDto) {
    const { search } = query;

    const sql = Prisma.sql`
      SELECT
        s.id AS id,
        s."displayName" AS "displayName",
        s.esp AS esp,
        s.priority AS priority,
        s.target AS target,
        s."sentCount" AS "sentCount",
        s."createdAt" AS "createdAt"
      FROM sender S
      ${search ? Prisma.sql`WHERE s."displayName" ILIKE ${search}` : Prisma.empty}
      ORDER BY s.priority ASC, s."createdAt" ASC
    `;

    const senders = await this.prisma.$queryRaw<Sender[]>(sql);

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
        s.email AS email,
        s.esp AS esp,
        s.priority AS priority,
        s.target AS target,
        s."sentCount" AS "sentCount",
        s."createdAt" AS "createdAt"
      FROM sender S
      WHERE s.id = ${id}
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

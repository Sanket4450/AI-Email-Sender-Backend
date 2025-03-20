import { Injectable, CustomHttpException, HttpStatus } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { SenderService } from '../sender/sender.service';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly senderService: SenderService,
  ) {}

  // Create a new email
  async create(body: CreateEmailDto) {
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
    }));

    await this.prisma.email.createMany({
      data: createData,
    });

    return responseBuilder({
      message: SUCCESS_MSG.EMAIL_CREATED,
    });
  }

  // Update an email (only scheduledAt can be updated)
  async update(id: string, body: UpdateEmailDto) {
    const { senderId, contactIds, ...updateEmailBody } = body;

    const email = await this.emailExists(id);

    if (!email.scheduledAt) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        ERROR_MSG.EMAIL_CANNOT_MODIFY,
      );
    }

    // Validate that the sender exists
    if (senderId) await this.senderService.senderExists(senderId);

    // Validate that the contact exists
    if (contactIds) {
      const contacts = await this.prisma.contact.findMany({
        where: { id: { in: contactIds } },
      });

      if (contacts.length !== contactIds.length) {
        throw new CustomHttpException(
          HttpStatus.BAD_REQUEST,
          ERROR_MSG.ONE_OR_MORE_CONTACTS_NOT_FOUND,
        );
      }
    }

    await this.prisma.email.update({
      where: { id },
      data: {
        ...updateEmailBody,
        ...(senderId && { sender: { connect: { id: senderId } } }),
        ...(contactIds?.length && {
          : {
            create: contactIds.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
      },
    });
  }

  // Delete an email (only if it's scheduled)
  async remove(id: string) {
    const email = await this.prisma.email.findUnique({ where: { id } });

    if (!email) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.EMAIL_NOT_FOUND,
      );
    }

    if (!email.scheduledAt) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        ERROR_MSG.EMAIL_CANNOT_MODIFY,
      );
    }

    return this.prisma.email.delete({ where: { id } });
  }

  // Get all emails with filters
  async findAll(filters: FilterEmailDto) {
    const { subject, isBounced, isSpamReported, eventType } = filters;

    return this.prisma.email.findMany({
      where: {
        subject: { contains: subject, mode: 'insensitive' },
        isBounced,
        isSpamReported,
        events: eventType ? { some: { eventType } } : undefined,
      },
      include: {
        contact: true,
        events: true,
      },
    });
  }

  // Get a single email by ID
  async findOne(id: string) {
    const email = await this.prisma.email.findUnique({
      where: { id },
      include: {
        contact: true,
        events: true,
      },
    });

    if (!email) {
      throw new CustomHttpException(
        ERROR_MSG.EMAIL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return email;
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

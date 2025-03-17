import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UpdateESPDto } from './dto/update-esp.dto';
import { CreateESPDto } from './dto/create-esp.dto';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { GetESPsDto } from './dto/get-esps.dto';
import { CustomHttpException } from 'src/app/exceptions/error.exception';

@Injectable()
export class ESPService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new esp
  async createESP(body: CreateESPDto) {
    const existingESP = await this.prisma.eSP.findFirst({
      where: { title: { equals: body.title, mode: 'insensitive' } },
    });

    if (existingESP) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        ERROR_MSG.ESP_ALREADY_EXISTS,
      );
    }

    await this.prisma.eSP.create({ data: body });

    return responseBuilder({ message: SUCCESS_MSG.TAG_CREATED });
  }

  // Update an esp by ID
  async updateESP(id: string, body: UpdateESPDto) {
    await this.espExists(id);

    if (body.title) {
      const existingESP = await this.prisma.eSP.findFirst({
        where: {
          title: { equals: body.title, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existingESP) {
        throw new CustomHttpException(
          HttpStatus.CONFLICT,
          ERROR_MSG.ESP_ALREADY_EXISTS,
        );
      }
    }

    await this.prisma.eSP.update({
      where: { id },
      data: body,
    });

    return responseBuilder({ message: SUCCESS_MSG.TAG_UPDATED });
  }

  // Delete an esp by ID
  async deleteESP(id: string) {
    await this.espExists(id);

    await this.prisma.eSP.delete({ where: { id } });

    return responseBuilder({ message: SUCCESS_MSG.TAG_DELETED });
  }

  // Get all esps
  async getESPs(query: GetESPsDto) {
    const esps = await this.prisma.eSP.findMany({
      where: { ...(query.search && { title: { contains: query.search } }) },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    });

    return responseBuilder({ message: SUCCESS_MSG.TAGS_FETCHED, result: esps });
  }

  // Check if a esp exists
  async espExists(id: string) {
    const esp = await this.prisma.eSP.findUnique({ where: { id } });

    if (!esp) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.ESP_NOT_FOUND,
      );
    }

    return esp;
  }
}

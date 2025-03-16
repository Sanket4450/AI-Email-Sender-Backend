import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { GetTagsDto } from './dto/get-tags.dto';
import { getPagination } from 'src/app/utils/common.utils';
import { CustomHttpException } from 'src/app/exceptions/error.exception';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new tag
  async createTag(body: CreateTagDto) {
    const existingTag = await this.prisma.tag.findFirst({
      where: { title: { equals: body.title, mode: 'insensitive' } },
    });

    if (existingTag) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        ERROR_MSG.TAG_ALREADY_EXISTS,
      );
    }

    await this.prisma.tag.create({ data: body });

    return responseBuilder({ message: SUCCESS_MSG.TAG_CREATED });
  }

  // Update an tag by ID
  async updateTag(id: string, data: UpdateTagDto) {
    await this.tagExists(id);

    await this.prisma.tag.update({
      where: { id },
      data,
    });

    return responseBuilder({ message: SUCCESS_MSG.TAG_UPDATED });
  }

  // Delete an tag by ID
  async deleteTag(id: string) {
    await this.tagExists(id);

    await this.prisma.tag.delete({ where: { id } });

    return responseBuilder({ message: SUCCESS_MSG.TAG_DELETED });
  }

  // Get all tags
  async getTags(query: GetTagsDto) {
    console.log(query);
    const { offset, limit } = getPagination(query);

    const tags = await this.prisma.tag.findMany({
      where: { ...(query.search && { title: { contains: query.search } }) },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
      skip: offset,
      take: limit,
    });

    return responseBuilder({ message: SUCCESS_MSG.TAGS_FETCHED, result: tags });
  }

  // Check if a tag exists
  async tagExists(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });

    if (!tag) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.TAG_NOT_FOUND,
      );
    }

    return tag;
  }
}

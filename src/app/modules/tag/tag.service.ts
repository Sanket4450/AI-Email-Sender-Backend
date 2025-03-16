import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { SUCCESS_MSG } from 'src/app/utils/messages';
import { GetTagsDto } from './dto/get-tags.dto';
import { getPagination } from 'src/app/utils/common.utils';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new tag
  async createTag(data: CreateTagDto) {
    await this.prisma.tag.create({ data });

    return responseBuilder({ message: SUCCESS_MSG.TAG_CREATED });
  }

  // Update an tag by ID
  async updateTag(id: string, data: UpdateTagDto) {
    await this.prisma.tag.update({
      where: { id },
      data,
    });

    return responseBuilder({ message: SUCCESS_MSG.TAG_UPDATED });
  }

  // Delete an tag by ID
  async deleteTag(id: string) {
    await this.prisma.tag.delete({ where: { id } });

    return responseBuilder({ message: SUCCESS_MSG.TAG_DELETED });
  }

  // Get all tags
  async getTags(query: GetTagsDto) {
    const { offset, limit } = getPagination(query);

    return this.prisma.tag.findMany({
      where: { ...(query.search && { title: { contains: query.search } }) },
      select: { id: true, title: true },
      skip: offset,
      take: limit,
    });
  }
}

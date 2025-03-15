import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new tag
  async createTag(data: CreateTagDto) {
    return this.prisma.tag.create({ data });
  }

  // Update an tag by ID
  async updateTag(id: string, data: UpdateTagDto) {
    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

  // Delete an tag by ID
  async deleteTag(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }

  // Get all tags
  async getAllIndustries() {
    return this.prisma.tag.findMany({ select: { id: true, title: true } });
  }
}

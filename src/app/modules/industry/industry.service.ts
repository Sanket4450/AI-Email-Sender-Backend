import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';

@Injectable()
export class IndustryService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new industry
  async createIndustry(data: CreateIndustryDto) {
    return this.prisma.industry.create({ data });
  }

  // Update an industry by ID
  async updateIndustry(id: string, data: UpdateIndustryDto) {
    return this.prisma.industry.update({
      where: { id },
      data,
    });
  }

  // Delete an industry by ID
  async deleteIndustry(id: string) {
    return this.prisma.industry.delete({ where: { id } });
  }

  // Get all industries
  async getAllIndustries() {
    return this.prisma.industry.findMany({ select: { id: true, title: true } });
  }
}

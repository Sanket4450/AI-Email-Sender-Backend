import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected successfully!');
    } catch (error) {
      console.error('❌ Failed to connect to the database:', error.message);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Disconnected from the database.');
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class TagQuery {
  constructor() {}

  getTagSelectFields = (): Prisma.Sql => Prisma.sql`
    t.id AS id,
    t.title AS title
  `;
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class SenderQuery {
  constructor() {}

  getSenderSelectFields = (): Prisma.Sql => Prisma.sql`
    s.id AS id,
    s."displayName" AS "displayName",
    s.name AS name,
    s.email AS email,
    s.esp AS esp,
    s.priority AS priority,
    s.target AS target,
    s."sentCount" AS "sentCount",
    s."createdAt" AS "createdAt"
  `;
}

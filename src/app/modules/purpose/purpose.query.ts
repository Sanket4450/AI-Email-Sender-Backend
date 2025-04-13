import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated';

@Injectable()
export class PurposeQuery {
  constructor() {}

  getPurposeSelectFields = (): Prisma.Sql => Prisma.sql`
    c.id AS id,
    c.title AS title,
    c.description AS description,
    c."createdAt" AS "createdAt",
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', t.id,
          'title', t.title
        )
      ) FILTER (WHERE t.id IS NOT NULL), '[]'::JSON
    ) AS tags
  `;

  getPurposeJoinClause = (): Prisma.Sql => Prisma.sql`
    LEFT JOIN purpose_tag pt ON p.id = pt."purposeId"
    LEFT JOIN tag t ON pt."tagId" = t.id AND t."isDeleted" = false
  `;
}

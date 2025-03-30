import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyQuery {
  constructor() {}

  getCompanySelectFields = (): Prisma.Sql => Prisma.sql`
    c.id AS id,
    c.title AS title,
    c.description AS description,
    c.location AS location,
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

  getCompanyJoinClause = (): Prisma.Sql => Prisma.sql`
    LEFT JOIN company_tag ct ON c.id = ct."companyId"
    LEFT JOIN tag t ON ct."tagId" = t.id AND t."isDeleted" = false
  `;
}

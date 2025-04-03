import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContactQuery {
  constructor() {}

  getContactSelectFields = (
    getAllFields: boolean = false,
  ): Prisma.Sql => Prisma.sql`
    c.id AS id,
    c.name AS name,
    c.position AS position,
    c.email AS email,
    c.phone AS phone,
    c."linkedInUrl" AS "linkedInUrl",
    c.location AS location,
    c."createdAt" AS "createdAt",

    JSON_BUILD_OBJECT(
      'id', co.id,
      'title', co.title
      ${
        getAllFields
          ? Prisma.sql`,
            'description', co.description,
            'location', co.location,
            'createdAt', co."createdAt"
          `
          : Prisma.empty
      }
    ) AS company,

    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', t.id,
          'title', t.title
        )
      ) FILTER (WHERE t.id IS NOT NULL), '[]'::JSON
    ) AS tags
  `;

  getContactJoinClause = (): Prisma.Sql => Prisma.sql`
    JOIN company co ON c."companyId" = co.id
    LEFT JOIN contact_tag ct ON c.id = ct."contactId"
    LEFT JOIN tag t ON ct."tagId" = t.id
  `;
}

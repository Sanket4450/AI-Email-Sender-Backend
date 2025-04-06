import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmailQuery {
  constructor() {}

  getEmailSelectFields = (
    getAllFields: boolean = false,
  ): Prisma.Sql => Prisma.sql`
    e.id AS id,
    ${getAllFields ? Prisma.sql`e.body AS body,` : Prisma.empty}
    e.subject AS subject,
    e."isBounced" AS "isBounced",
    e."isSpamReported" AS "isSpamReported",
    e."createdAt" AS "createdAt",
    JSON_BUILD_OBJECT(
      'id', c.id,
      'name', c."name"
      ${
        getAllFields
          ? Prisma.sql`,
            'position', c.position,
            'email', c.email,
            'phone', c.phone,
            'linkedInUrl', c."linkedInUrl",
            'location', c.location
            `
          : Prisma.empty
      }
    ) AS contact,

    JSON_BUILD_OBJECT(
      'id', s.id,
      'displayName', s."displayName"
    ) AS sender,

    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', t.id,
          'title', t.title
        )
      ) FILTER (WHERE t.id IS NOT NULL), '[]'::JSON
    ) AS tags,
    
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', ev.id,
          'eventType', ev."eventType"
        )
      ) FILTER (WHERE ev.id IS NOT NULL), '[]'::JSON
    ) AS events
  `;

  getJoinClause = (): Prisma.Sql => Prisma.sql`
    JOIN contact c ON c.id = e."contactId"
    JOIN sender s ON s.id = e."senderId"
    LEFT JOIN email_event ev ON ev."emailId" = e.id
    LEFT JOIN email_tag et ON c.id = et."emailId"
    LEFT JOIN tag t ON et."tagId" = t.id AND t."isDeleted" = false
  `;

  getGroupByClause = (): Prisma.Sql => Prisma.sql`
    GROUP BY e.id, c.id, s.id
  `;
}

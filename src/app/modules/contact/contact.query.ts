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
          'id', ev.id,
          'eventType', ev."eventType"
        )
      ) FILTER (WHERE ev.id IS NOT NULL), '[]'::JSON
    ) AS events
  `;
}

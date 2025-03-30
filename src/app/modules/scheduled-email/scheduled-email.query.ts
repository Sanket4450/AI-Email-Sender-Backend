import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class ScheduledEmailQuery {
  constructor() {}

  getScheduledEmailSelectFields = (
    getAllFields: boolean = false,
  ): Prisma.Sql => Prisma.sql`
    e.id AS id,
    e.subject AS subject,
    e."scheduledAt" AS "scheduledAt",
    e."createdAt" AS "createdAt",
    JSON_BUILD_OBJECT(
      'id', s.id,
      'displayName', s."displayName"
    ) AS sender,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', c.id,
          'name', c.name
          ${
            getAllFields
              ? Prisma.sql`,
                'position', c.position,
                'email', c.email,
                'phone', c.phone,
                'linkedInUrl', c."linkedInUrl",
                'location', c.location`
              : Prisma.empty
          }
        )
      ) FILTER (WHERE c.id IS NOT NULL), '[]'::JSON
    ) AS contacts
  `;

  getScheduledEmailJoinClause = (): Prisma.Sql => Prisma.sql`
    JOIN sender s ON s.id = e."senderId"
    LEFT JOIN scheduled_email_contact dc ON e.id = dc."emailId"
    LEFT JOIN contact c ON dc."contactId" = c.id
  `;
}

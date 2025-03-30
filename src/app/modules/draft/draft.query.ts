import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class DraftQuery {
  constructor() {}

  getDraftSelectFields = (
    getAllFields: boolean = false,
  ): Prisma.Sql => Prisma.sql`
    d.id AS id,
    d.subject AS subject,
    ${getAllFields ? Prisma.sql`d.body AS body,` : Prisma.empty}
    d."createdAt" AS "createdAt",
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', c.id,
          'name', c.name
          ${
            getAllFields
              ? Prisma.sql`
                ,
                'position', c.position,
                  'email', c.email,
                  'phone', c.phone,
                  'linkedInUrl', c."linkedInUrl",
                  'location', c.location
                `
              : Prisma.empty
          }
        )
      ) FILTER (WHERE c.id IS NOT NULL), '[]'::JSON
    ) AS contacts
  `;

  getDraftJoinClause = (): Prisma.Sql => Prisma.sql`
    LEFT JOIN draft_contact dc ON d.id = dc."draftId"
    LEFT JOIN contact c ON dc."contactId" = c.id
  `;
}

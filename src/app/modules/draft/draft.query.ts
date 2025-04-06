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
    d."scheduledAt" AS "scheduledAt",
    d."createdAt" AS "createdAt",
    CASE WHEN d.id IS NOT NULL THEN
      JSON_BUILD_OBJECT(
        'id', s.id,
        'displayName', s."displayName"
      ) ELSE '{}'::JSON
    END AS sender,
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
    ) AS contacts,
    
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', t.id,
          'title', t.title
        )
      ) FILTER (WHERE t.id IS NOT NULL), '[]'::JSON
    ) AS tags
  `;

  getDraftJoinClause = (): Prisma.Sql => Prisma.sql`
    LEFT JOIN sender s ON s.id = d."senderId"
    LEFT JOIN draft_contact dc ON d.id = dc."draftId"
    LEFT JOIN contact c ON dc."contactId" = c.id
    LEFT JOIN draft_tag dt ON c.id = dt."draftId"
    LEFT JOIN tag t ON dt."tagId" = t.id AND t."isDeleted" = false
  `;

  getGroupByClause = (): Prisma.Sql => Prisma.sql`
    GROUP BY d.id, s.id
  `;
}

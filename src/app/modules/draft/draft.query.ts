import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated';

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
    CASE WHEN s.id IS NOT NULL THEN
      JSON_BUILD_OBJECT(
        'id', s.id,
        'displayName', s."displayName"
      ) ELSE '{}'::JSON
    END AS sender,
    COALESCE(c.contacts, '[]'::JSON) AS contacts,
    COALESCE(t.tags, '[]'::JSON) AS tags
  `;

  getDraftJoinClause = (): Prisma.Sql => Prisma.sql`
    LEFT JOIN sender s ON s.id = d."senderId"
    LEFT JOIN contacts_agg c ON c."draftId" = d.id
    LEFT JOIN tags_agg t ON t."draftId" = d.id
  `;

  getContactsCTE = (getAllFields: boolean = false): Prisma.Sql => Prisma.sql`
    SELECT
      dc."draftId",
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
      ) FILTER (WHERE c.id IS NOT NULL)
      AS contacts
    FROM draft_contact dc
    LEFT JOIN contact c ON c.id = dc."contactId"
    GROUP BY dc."draftId"
  `;

  getTagsCTE = (): Prisma.Sql => Prisma.sql`
    SELECT
		  dt."draftId",
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', t.id,
          'title', t.title
        ) 
      ) FILTER (WHERE t.id IS NOT NULL)
      AS tags
    FROM draft_tag dt
    LEFT JOIN tag t ON t.id = dt."tagId"
    GROUP BY dt."draftId"
  `;
}

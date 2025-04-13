import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class TagQuery {
  constructor() {}

  getTagSelectFields = (
    getAllFields: boolean = false,
  ): Prisma.Sql => Prisma.sql`
    t.id AS id,
    t.title AS title
    ${
      getAllFields
        ? Prisma.sql`
          , 
          COUNT(DISTINCT ct) AS "companyCount",
          COUNT(DISTINCT cot) AS "contactCount",
          COUNT(DISTINCT et) AS "emailCount",
          COUNT(DISTINCT dt) AS "draftCount"
        `
        : Prisma.empty
    }
  `;

  getJoinClause = (): Prisma.Sql => Prisma.sql`
    LEFT JOIN company_tag ct ON ct."tagId" = t.id
    LEFT JOIN contact_tag cot ON cot."tagId" = t.id
    LEFT JOIN email_tag et ON et."tagId" = t.id
    LEFT JOIN draft_tag dt ON dt."tagId" = t.id
  `;
}

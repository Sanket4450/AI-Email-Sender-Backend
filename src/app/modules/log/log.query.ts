import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LOG_TYPES } from 'src/app/utils/constants';

@Injectable()
export class LogQuery {
  constructor() {}

  getLogSelectFields = (type: string): Prisma.Sql => {
    const commonFields = Prisma.sql`
      l.id AS id,
      l."createdAt" AS "createdAt"
    `;

    if (type === LOG_TYPES.LLM) {
      return Prisma.sql`
        ${commonFields},
        l.prompt AS prompt,
        l.response AS response,
        l."isError" AS "isError"
      `;
    } else {
      return Prisma.sql`
        ${commonFields},
        l.platform AS platform,
        l.body AS body,
      `;
    }
  };
}

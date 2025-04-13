import { Prisma } from 'prisma/generated';
import { Pagination, PaginationQuery } from '../types/common.type';
import { VALUES } from './constants';

export const removeWhiteSpace = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

export const getPagination = (
  query: Pagination,
  defaultLimit: number = VALUES.DEFAULT_PAGE_SIZE,
): PaginationQuery => {
  const page = query.page || 1;
  const limit = query.limit || defaultLimit;
  const offset = (page - 1) * limit;

  return { offset, limit };
};

export const getSearchCond = (keyword: string, keys: string[]) => {
  const searchConditions = keys.map(
    (key) => Prisma.sql`${Prisma.raw(key)} ILIKE ${`%${keyword}%`}`,
  );

  return Prisma.sql`(${Prisma.join(searchConditions, ' OR ')})`;
};

export const getFollowUpSubject = (subject: string): string => {
  return `Re: ${subject}`;
};

import { Pagination, PaginationQuery } from '../types/common.type';
import { VALUES } from './constants';

export const getPagination = (
  query: Pagination,
  defaultLimit: number = VALUES.DEFAULT_PAGE_SIZE,
): PaginationQuery => {
  const page = query.page || 1;
  const limit = query.limit || defaultLimit;
  const offset = (page - 1) * limit;

  return { offset, limit };
};

export const removeWhiteSpace = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

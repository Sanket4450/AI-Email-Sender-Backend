export interface Search {
  search: string;
}

export interface Pagination {
  page?: number;
  limit?: number;
}

export interface PaginationQuery {
  offset: number;
  limit: number;
}

export type QueryResponse<T> = Array<{
  count: number;
  data: T[];
}>;

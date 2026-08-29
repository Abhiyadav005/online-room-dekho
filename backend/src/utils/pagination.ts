export interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(pageValue: unknown, limitValue: unknown): Pagination {
  const page = Math.max(1, Math.min(Number(pageValue) || 1, 10_000));
  const limit = Math.max(1, Math.min(Number(limitValue) || 12, 100));
  return { page, limit, skip: (page - 1) * limit };
}

export function pageResult<T>(items: T[], total: number, pagination: Pagination) {
  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit)
  };
}

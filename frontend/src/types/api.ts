export type PaginatedResponse<T> = {
  total: number;
  items: T[];
  limit: number;
  offset: number;
};

export type DeleteResponse = {
  ok: boolean;
  id?: string;
};


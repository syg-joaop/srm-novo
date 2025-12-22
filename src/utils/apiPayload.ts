export type PagedListFilters = {
  search?: string;
  fantasia?: string;
  cidade?: string;
  status?: string;
  sortBy?: string;
};

export type PagedListBody = {
  page: number;
  size: number;
} & Partial<PagedListFilters>;

export const buildPagedBody = <T extends PagedListFilters>(
  page: number,
  size: number,
  filters?: T,
): PagedListBody => ({
  page,
  size,
  ...filters,
});

export const buildPagedListBody = (
  page: number,
  size: number,
  filters?: PagedListFilters,
): PagedListBody => {
  const body: PagedListBody = { page, size };
  if (!filters) return body;

  const { search, fantasia, cidade, status, sortBy } = filters;

  if (search) body.search = search;
  if (fantasia) body.fantasia = fantasia;
  if (cidade) body.cidade = cidade;
  if (status && status !== "todos") body.status = status;
  if (sortBy) body.sortBy = sortBy;

  return body;
};

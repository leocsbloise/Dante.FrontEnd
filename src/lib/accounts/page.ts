export const ACCOUNT_PAGE_SIZE = 10;

export function accountPage<T>(items: T[], page: number) {
  const pages = Math.max(1, Math.ceil(items.length / ACCOUNT_PAGE_SIZE));
  const current = Math.min(Math.max(page, 1), pages);
  const start = (current - 1) * ACCOUNT_PAGE_SIZE;
  return {
    items: items.slice(start, start + ACCOUNT_PAGE_SIZE),
    page: current,
    pages,
  };
}

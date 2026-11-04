/** The pages of the Settings screen. `hub` is the main list; `password` opens from Account. */
export type Page = 'hub' | 'account' | 'data' | 'app' | 'about' | 'password';

/** Where Back goes from a page: the page above it, or null from the hub (the app handles that one). */
export function parentOf(page: Page): Page | null {
  if (page === 'hub') return null;
  return page === 'password' ? 'account' : 'hub';
}

/** The rows of the hub, in order, for the pages this app has. */
export function hubPages(has: { data: boolean; app: boolean }): Exclude<Page, 'hub' | 'password'>[] {
  return ['account', ...(has.data ? (['data'] as const) : []), ...(has.app ? (['app'] as const) : []), 'about'];
}

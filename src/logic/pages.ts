/** The ids of the kit's own pages (7.29.0). An app page (`extraPages`) may not use one: such a page is left out, with a warning. */
export const RESERVED_PAGE_IDS = ['hub', 'account', 'data', 'app', 'about', 'password', 'support', 'signOut', 'deleteAccount', 'access'] as const;

/** The kit's own pages. */
export type BuiltinPage = (typeof RESERVED_PAGE_IDS)[number];

const RESERVED = new Set<string>(RESERVED_PAGE_IDS);

/** True for an id the kit uses for a page of its own. */
export const isReservedPageId = (id: string): boolean => RESERVED.has(id);

/** The app's pages the screen can show, and the ids it had to leave out because the kit uses them (7.29.0). */
export function usableExtraPages<P extends { id: string }>(pages: readonly P[] = []): { pages: readonly P[]; clashes: readonly string[] } {
  const clashes = pages.filter((p) => RESERVED.has(p.id)).map((p) => p.id);
  return { pages: clashes.length ? pages.filter((p) => !RESERVED.has(p.id)) : pages, clashes };
}

/** The pages of the Settings screen: the kit's own, or the id of a page the app added (`extraPages`). `hub` is the main list; `password` opens from Account, `support` (Contact Support) from About; `signOut` and `deleteAccount` (7.17.0, with `exitMenu`) open from Account's ⋯ menu, or from `access` (7.24.0, `exitMenu.place: 'page'`), a page under Account. */
export type Page = BuiltinPage | (string & {});

/**
 * Where Back goes from a page: the page above it, or null from the hub (the app handles that one).
 * With `exitOnPage` (7.24.0, `exitMenu.place: 'page'`), Sign out and Delete account go back to the Access page instead of Account.
 * `accountPages` are the ids of the app's pages that live inside Account (`under: 'account'`), `appPages` those inside App (`under: 'app'`).
 */
export function parentOf(page: Page, accountPages: readonly string[] = [], appPages: readonly string[] = [], exitOnPage = false): Page | null {
  if (page === 'hub') return null;
  if (exitOnPage && (page === 'signOut' || page === 'deleteAccount')) return 'access';
  if (page === 'access') return 'account';
  if (page === 'password' || page === 'signOut' || page === 'deleteAccount' || accountPages.includes(page)) return 'account';
  if (page === 'support') return 'about';
  return appPages.includes(page) ? 'app' : 'hub';
}

/** A row on the main list: one of the kit's pages, or the id of an extra page. */
export type HubPage = string;

/** The order of the hub rows when the app does not choose one. Extra pages go before About. */
export const DEFAULT_HUB_ORDER: readonly HubPage[] = ['account', 'data', 'app', 'about'];

/**
 * The rows of the hub, for the pages this app has. `order` is the app's own order: pages it leaves out follow in the default order (extra pages just before About); repeats and unknown names are ignored.
 * Pages the app does not have (no `data`, no `app`) never appear, whatever the order says.
 */
export function hubPages(has: { data: boolean; app: boolean }, order?: readonly HubPage[], extra: readonly string[] = []): HubPage[] {
  const known = [...DEFAULT_HUB_ORDER.slice(0, -1), ...extra, 'about'];
  const present = (page: HubPage) => (page === 'data' ? has.data : page === 'app' ? has.app : known.includes(page));
  const seen = new Set<HubPage>();
  const out: HubPage[] = [];
  for (const page of [...(order ?? []), ...known]) {
    if (seen.has(page) || !present(page)) continue;
    seen.add(page);
    out.push(page);
  }
  return out;
}

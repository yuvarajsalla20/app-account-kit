/** The kit's own pages. */
export type BuiltinPage = 'hub' | 'account' | 'data' | 'app' | 'about' | 'password';

/** The pages of the Settings screen: the kit's own, or the id of a page the app added (`extraPages`). `hub` is the main list; `password` opens from Account. */
export type Page = BuiltinPage | (string & {});

/**
 * Where Back goes from a page: the page above it, or null from the hub (the app handles that one).
 * `accountPages` are the ids of the app's pages that live inside Account (`under: 'account'`).
 */
export function parentOf(page: Page, accountPages: readonly string[] = []): Page | null {
  if (page === 'hub') return null;
  return page === 'password' || accountPages.includes(page) ? 'account' : 'hub';
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

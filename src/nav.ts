import { createContext, useContext } from 'react';
import type { Page } from './logic/pages';

/** Moves between Settings pages from inside an app's own page. */
export interface SettingsNav {
  /**
   * Opens another Settings page by id (`'account'`, `'data'` or an added page's id), such as a shortcut from the Premium page to Data Export.
   * Back then returns to the page that opened it, not to the page's usual parent.
   */
  open: (page: Page) => void;
}

export const SettingsNavContext = createContext<SettingsNav | null>(null);

/** For an app's own page inside `SettingsScreen`: open another Settings page. Outside the screen it returns null. */
export const useSettingsNav = (): SettingsNav | null => useContext(SettingsNavContext);

import type { AccountTheme } from '../../src/theme';

const TINTS = ['account', 'app', 'about', 'password', 'data', 'share', 'rate', 'privacy', 'support', 'version'] as const;
// Plain words stand in for colors: the tests never look at them.
export const THEME: AccountTheme = {
  text: 't', muted: 'm', faint: 'f', accent: 'a', ink: 'i', surface: 's', border: 'b', line: 'l', field: 'fd', panel: 'p', danger: 'd', on: 'o', radius: 10,
  tints: Object.fromEntries(TINTS.map((k) => [k, k])) as AccountTheme['tints'],
};

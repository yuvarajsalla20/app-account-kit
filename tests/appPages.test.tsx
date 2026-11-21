import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../src/SettingsScreen';
import { parentOf } from '../src/logic/pages';
import { appGroups } from '../src/sections/AppPage';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { Text } from './stubs/react-native';
import { THEME } from './helpers/theme';
import { mount, press } from './helpers/render';

// 7.10.0: pages that live inside the App page (Preferences) with `under: 'app'`.
const props = (over: Partial<SettingsScreenProps> = {}): SettingsScreenProps => ({
  onBack: vi.fn(),
  profile: { name: 'Sam', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  about: { appName: 'My App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: true, onSignOut: async () => {}, onDeleteAccount: async () => {} },
  ...over,
});
const screen = (p: SettingsScreenProps) => mount(<SettingsScreen theme={THEME} {...p} />);
const family = { id: 'family', label: 'Connect as Family', icon: 'users', content: <Text>Family page</Text>, under: 'app' } as const;
const exportPage = { id: 'export', label: 'Data Export', icon: 'download', content: <Text>Export page</Text>, value: 'VIP', under: 'app' } as const;
const shown = (h: ReturnType<typeof screen>, t: string) => h.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === t).length > 0;

describe("pages under 'app' (Preferences)", () => {
  it('Back from a page under App returns to App, then to the list', () => {
    expect(parentOf('family', [], ['family'])).toBe('app');
    expect(parentOf('export', ['export'], ['family'])).toBe('account');
    expect(parentOf('family')).toBe('hub');
  });

  it('shows the rows on the App page under the app settings, not on the main list or Account, and Back returns to App', async () => {
    const p = props({ app: { content: <Text>Currency</Text> }, extraPages: [exportPage, family] });
    const h = screen(p);
    expect(h.has('Connect as Family')).toBe(false);
    expect(h.has('Data Export')).toBe(false);
    await press(h.byLabel(S.account));
    expect(h.has('Connect as Family')).toBe(false);
    await press(h.byLabel(S.back));
    await press(h.byLabel(S.app));
    expect(shown(h, 'Currency')).toBe(true);
    expect(h.has('Connect as Family')).toBe(true);
    expect(h.byLabel('Data Export')?.props.accessibilityValue).toEqual({ text: 'VIP' });
    await press(h.byLabel('Connect as Family'));
    expect(shown(h, 'Family page')).toBe(true);
    await press(h.byLabel(S.back));
    expect(shown(h, 'Currency')).toBe(true);
    await press(h.byLabel(S.back));
    expect(h.has(S.signOut)).toBe(true);
    expect(p.onBack).not.toHaveBeenCalled();
  });

  it('shows the App row when only pages live there (no app settings)', async () => {
    const h = screen(props({ extraPages: [family] }));
    await press(h.byLabel(S.app));
    await press(h.byLabel('Connect as Family'));
    expect(shown(h, 'Family page')).toBe(true);
  });

  it('keeps the App row hidden when there is neither app settings nor a page under it (as before)', () => {
    const h = screen(props({ extraPages: [{ ...family, under: undefined }] }));
    expect(h.has(S.app)).toBe(false);
    expect(h.has('Connect as Family')).toBe(true);
  });

  it("leaves 'account' pages where they were", async () => {
    const h = screen(props({ app: { content: null }, extraPages: [{ ...exportPage, under: 'account' }] }));
    await press(h.byLabel(S.account));
    expect(h.has('Data Export')).toBe(true);
    await press(h.byLabel('Data Export'));
    await press(h.byLabel(S.back));
    expect(h.has(S.nickname)).toBe(true);
  });

  it('puts rows with a group in their own titled card after the untitled one (7.11.0)', async () => {
    const widgets = { id: 'widgets', label: 'Home Screen Widgets', icon: 'grid', content: <Text>Widgets page</Text>, under: 'app', group: 'On Your iPhone' } as const;
    const countdown = { ...widgets, id: 'countdown', label: 'Lock Screen Countdown', content: <Text>Countdown page</Text> } as const;
    const groups = appGroups([widgets, exportPage, countdown]);
    expect(groups.map((g) => [g.title, g.pages.map((p) => p.id)])).toEqual([[undefined, ['export']], ['On Your iPhone', ['widgets', 'countdown']]]);
    expect(appGroups([widgets]).map((g) => g.title)).toEqual(['On Your iPhone']);
    const h = screen(props({ extraPages: [exportPage, widgets, countdown] }));
    await press(h.byLabel(S.app));
    expect(shown(h, 'On Your iPhone')).toBe(true);
    await press(h.byLabel('Lock Screen Countdown'));
    expect(shown(h, 'Countdown page')).toBe(true);
    await press(h.byLabel(S.back));
    expect(h.has('Home Screen Widgets')).toBe(true);
  });
});

describe('reserved page ids (7.29.0)', () => {
  it('the ExtraPage.id doc names every reserved id, and the screen uses the same list', async () => {
    const { readFileSync } = await import('node:fs');
    const { RESERVED_PAGE_IDS } = await import('../src/logic/pages');
    const types = readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8');
    const doc = types.slice(types.indexOf('export interface ExtraPage'), types.indexOf('  id: string;', types.indexOf('export interface ExtraPage')));
    const named = [...doc.matchAll(/`(\w+)`/g)].map((m) => m[1]).filter((w) => w !== 'onError' && w !== 'extraPages' && w !== 'RESERVED_PAGE_IDS');
    expect(new Set(named)).toEqual(new Set(RESERVED_PAGE_IDS));
    const screenSrc = readFileSync(new URL('../src/SettingsScreen.tsx', import.meta.url), 'utf8');
    expect(screenSrc).toContain('new Set<string>(RESERVED_PAGE_IDS)');
  });

  it("an app page called 'support' is left out and reported; the kit's Contact Support shows alone", async () => {
    const onError = vi.fn();
    const clash = { id: 'support', label: 'Help', icon: 'help-circle', content: <Text>App help page</Text> } as const;
    const h = screen(props({ extraPages: [clash], onError }));
    expect(h.has('Help')).toBe(false);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toBe('extraPages');
    expect(String(onError.mock.calls[0]![1])).toContain('support');
    await press(h.byLabel(S.about));
    await press(h.byLabel(S.contactSupport));
    expect(shown(h, 'App help page')).toBe(false);
    await press(h.byLabel(S.back));
    expect(h.has(S.contactSupport)).toBe(true);
  });

  it('pages with their own ids are kept, and nothing is reported', () => {
    const onError = vi.fn();
    const h = screen(props({ extraPages: [{ ...family, under: undefined }], onError }));
    expect(h.has('Connect as Family')).toBe(true);
    expect(onError).not.toHaveBeenCalled();
  });
});

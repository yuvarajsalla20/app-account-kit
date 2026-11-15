import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../src/SettingsScreen';
import { parentOf } from '../src/logic/pages';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { Text } from './stubs/react-native';
import { THEME } from './helpers/theme';
import { mount, press } from './helpers/render';

// 7.10.0: pages that live inside the App page (Preferences) with `under: 'app'`.
const props = (over: Partial<SettingsScreenProps> = {}): SettingsScreenProps => ({
  onBack: vi.fn(),
  profile: { name: 'Yuva', fallbackName: 'App', email: 'a@b.com', photo: '' },
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
});

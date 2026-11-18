import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../src/SettingsScreen';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { THEME } from './helpers/theme';
import { mount, press } from './helpers/render';

const base: SettingsScreenProps = {
  onBack: vi.fn(),
  profile: { name: 'Sam', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  about: { appName: 'My Unique App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: true, onSignOut: async () => {}, onDeleteAccount: async () => {} },
};
const named = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === 'My Unique App').length;

describe('About header (7.16.0)', () => {
  it('shows the app name at the top of About by default', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...base} />);
    await press(h.byLabel(S.about));
    expect(named(h)).toBeGreaterThan(0);
  });

  it('leaves it out with showHeader false', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...base} about={{ ...base.about, showHeader: false }} />);
    await press(h.byLabel(S.about));
    expect(named(h)).toBe(0);
    expect(h.byLabel(S.privacy)).toBeTruthy();
  });

  it('keeps the normal page header (title About) when the top name is left out (7.16.1)', async () => {
    const titled = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'header' && n.props.children === S.about).length;
    const plain = mount(<SettingsScreen theme={THEME} {...base} />);
    await press(plain.byLabel(S.about));
    expect(titled(plain)).toBe(0);
    const h = mount(<SettingsScreen theme={THEME} {...base} about={{ ...base.about, showHeader: false }} />);
    await press(h.byLabel(S.about));
    expect(titled(h)).toBeGreaterThan(0);
  });
});

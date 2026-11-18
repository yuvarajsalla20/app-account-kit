import { View } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../src/SettingsScreen';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { THEME } from './helpers/theme';
import { mount, press } from './helpers/render';

const props: SettingsScreenProps = {
  onBack: vi.fn(),
  profile: { name: 'Sam', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  about: { appName: 'My App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: true, onSignOut: async () => {}, onDeleteAccount: async () => {} },
};
const count = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => n.props.testID === 'footer').length;

describe('footer', () => {
  it('draws the app footer at the end of the main list only', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...props} footer={<View testID="footer" />} />);
    expect(count(h)).toBeGreaterThan(0);
    await press(h.byLabel(S.account));
    expect(count(h)).toBe(0);
    await press(h.byLabel(S.back));
    expect(count(h)).toBeGreaterThan(0);
  });

  it('with footerOnEveryPage, draws it on other pages too (7.15.0)', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...props} footer={<View testID="footer" />} footerOnEveryPage />);
    expect(count(h)).toBeGreaterThan(0);
    await press(h.byLabel(S.account));
    expect(count(h)).toBeGreaterThan(0);
  });

  it('draws nothing extra when the app leaves it out', () => {
    const h = mount(<SettingsScreen theme={THEME} {...props} />);
    expect(count(h)).toBe(0);
  });
});

import { Pressable } from 'react-native';
import { describe, expect, it } from 'vitest';
import { SettingsScreen } from '../src/SettingsScreen';
import { useSettingsNav } from '../src/nav';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { Text } from './stubs/react-native';
import { THEME } from './helpers/theme';
import { mount, press } from './helpers/render';

/** The Premium page's Data Export perk: a shortcut to the page that lives in Account. */
function Shortcut() {
  const nav = useSettingsNav();
  return <Pressable accessibilityRole="button" accessibilityLabel="Open Data Export" onPress={() => nav?.open('export')}><Text>Data Export</Text></Pressable>;
}

const props: SettingsScreenProps = {
  onBack: () => {},
  profile: { name: 'Yuva', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  app: { content: null },
  about: { appName: 'My App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: false },
  extraPages: [
    { id: 'premium', label: 'Premium', icon: 'award', content: <Shortcut /> },
    { id: 'export', label: 'Data Export', icon: 'download', under: 'account', content: <Text>CSV File</Text> },
  ],
  hubOrder: ['about', 'account', 'app', 'premium'],
};
const title = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'header')[0]?.props.children;

describe('a feature inside a parent', () => {
  it('opens Data Export straight from Account, and Back returns to Account', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...props} />);
    expect(h.byLabel('Data Export')).toBeUndefined();
    await press(h.byLabel(S.account));
    expect(h.root.root.findAll((n) => n.props.children === S.yourData).length).toBe(0);
    await press(h.byLabel('Data Export'));
    expect(title(h)).toBe('Data Export');
    expect(h.root.root.findAll((n) => n.props.children === 'CSV File').length).toBeGreaterThan(0);
    await press(h.byLabel(S.back));
    expect(title(h)).toBe(S.account);
  });

  it('a shortcut from Premium opens Data Export, and Back returns to Premium', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...props} />);
    await press(h.byLabel('Premium'));
    await press(h.byLabel('Open Data Export'));
    expect(title(h)).toBe('Data Export');
    await press(h.byLabel(S.back));
    expect(title(h)).toBe('Premium');
    await press(h.byLabel(S.back));
    expect(title(h)).toBe(S.settings);
  });
});

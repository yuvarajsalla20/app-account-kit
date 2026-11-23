import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../src/SettingsScreen';
import { parentOf } from '../src/logic/pages';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { Pressable, Text } from './stubs/react-native';
import { useSettingsNav } from '../src/nav';
import { THEME } from './helpers/theme';
import { mount, press } from './helpers/render';

// 7.37.0: help pages live in About's Help card with `under: 'about'` (the Page rule: a page with nothing to set is help, not a preference).
const props = (over: Partial<SettingsScreenProps> = {}): SettingsScreenProps => ({
  onBack: vi.fn(),
  profile: { name: 'Sam', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  about: { appName: 'My App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: true, onSignOut: async () => {}, onDeleteAccount: async () => {} },
  ...over,
});
const screen = (p: SettingsScreenProps) => mount(<SettingsScreen theme={THEME} {...p} />);
const widgets = { id: 'widgets', label: 'Home Screen Widgets', icon: 'grid', content: <Text>How to Add</Text>, under: 'about' } as const;
const shown = (h: ReturnType<typeof screen>, t: string) => h.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === t).length > 0;

describe("pages under 'about' (Help)", () => {
  it('Back from a help page returns to About', () => {
    expect(parentOf('widgets', [], [], false, ['widgets'])).toBe('about');
  });

  it('shows the row in About beside Contact Support, not on the main list or Preferences, and Back returns to About', async () => {
    const p = props({ app: { content: <Text>Currency</Text> }, extraPages: [widgets] });
    const h = screen(p);
    expect(h.has('Home Screen Widgets')).toBe(false);
    await press(h.byLabel(S.app));
    expect(h.has('Home Screen Widgets')).toBe(false);
    await press(h.byLabel(S.back));
    await press(h.byLabel(S.about));
    expect(h.has(S.contactSupport)).toBe(true);
    await press(h.byLabel('Home Screen Widgets'));
    expect(shown(h, 'How to Add')).toBe(true);
    await press(h.byLabel(S.back));
    expect(h.has(S.contactSupport)).toBe(true);
    expect(p.onBack).not.toHaveBeenCalled();
  });

  it('7.38.0: startPage opens Settings on that page, and Back returns to the list', async () => {
    const p = props({ app: { content: <Text>Currency</Text> }, startPage: 'app' });
    const h = screen(p);
    expect(shown(h, 'Currency')).toBe(true);
    await press(h.byLabel(S.back));
    expect(h.has(S.about)).toBe(true);
    expect(p.onBack).not.toHaveBeenCalled();
    const none = screen(props({ startPage: 'nowhere' }));
    expect(none.has(S.about)).toBe(true);
  });

  it('8.1.0: about.supportPage replaces the email page under Contact Support, and Back returns to About', async () => {
    const base = props();
    const h = screen({ ...base, about: { ...base.about, supportPage: <Text>Support Form</Text> } });
    await press(h.byLabel(S.about));
    await press(h.byLabel(S.contactSupport));
    expect(shown(h, 'Support Form')).toBe(true);
    expect(h.has(S.writeToUs)).toBe(false);
    await press(h.byLabel(S.back));
    expect(h.has(S.contactSupport)).toBe(true);
    const plain = screen(props());
    await press(plain.byLabel(S.about));
    await press(plain.byLabel(S.contactSupport));
    expect(plain.has(S.writeToUs)).toBe(true);
  });

  it('8.1.0: useSettingsNav().back() takes the same step as the Back button', async () => {
    const Done = () => {
      const nav = useSettingsNav();
      return <Pressable accessibilityLabel="Done" onPress={() => nav?.back()} />;
    };
    const base = props();
    const h = screen({ ...base, about: { ...base.about, supportPage: <Done /> } });
    await press(h.byLabel(S.about));
    await press(h.byLabel(S.contactSupport));
    await press(h.byLabel('Done'));
    expect(h.has(S.contactSupport)).toBe(true);
    expect(base.onBack).not.toHaveBeenCalled();
  });
});

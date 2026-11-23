import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../src/SettingsScreen';
import { parentOf } from '../src/logic/pages';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { Text } from './stubs/react-native';
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
});

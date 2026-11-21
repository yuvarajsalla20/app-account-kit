import { View } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../src/SettingsScreen';
import { typedWordMatches } from '../src/logic/deleteRules';
import { parentOf } from '../src/logic/pages';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { THEME } from './helpers/theme';
import { mount, press, type } from './helpers/render';

const make = (over: Partial<SettingsScreenProps> = {}): SettingsScreenProps => ({
  onBack: vi.fn(),
  profile: { name: 'Sam', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  about: { appName: 'My App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: true, onSignOut: vi.fn(async () => {}), onDeleteAccount: vi.fn(async () => {}) },
  ...over,
});

describe('exitMenu (7.17.0)', () => {
  it('without it, Sign out and Delete account stay on the main list and Account has no ⋯', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...make()} />);
    expect(h.has(S.signOut)).toBe(true);
    expect(h.has(S.deleteAccount)).toBe(true);
    await press(h.byLabel(S.account));
    expect(h.has(S.moreOptions)).toBe(false);
  });

  it('moves both behind ⋯ on Account; Sign out has its own page', async () => {
    const p = make({ exitMenu: {} });
    const h = mount(<SettingsScreen theme={THEME} {...p} />);
    expect(h.has(S.signOut)).toBe(false);
    expect(h.has(S.deleteAccount)).toBe(false);
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.moreOptions));
    await press(h.byLabel(S.signOut));
    expect(h.has(S.stayIn)).toBe(true);
    await press(h.byLabel(S.signOut));
    expect(p.actions.onSignOut).toHaveBeenCalledTimes(1);
  });

  it('Delete: unlock, type DELETE, then password before anything is erased', async () => {
    const p = make({ exitMenu: { unlock: (done) => <View accessibilityLabel="unlock-now" onPress={done} />, losses: ['Every piece'] } });
    const h = mount(<SettingsScreen theme={THEME} {...p} />);
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.moreOptions));
    await press(h.byLabel(S.deleteAccount));
    expect(h.has(S.deleteTypeLabel('DELETE'))).toBe(false);
    await press(h.root.root.findAll((n) => n.props.accessibilityLabel === 'unlock-now')[0]!);
    const box = h.byLabel(S.deleteTypeLabel('DELETE'));
    expect(h.byLabel(S.continue).props.accessibilityState.disabled).toBe(true);
    type(box, 'delete ');
    expect(h.byLabel(S.continue).props.accessibilityState.disabled).toBe(false);
    await press(h.byLabel(S.continue));
    expect(h.byLabel(S.deleteForever).props.accessibilityState.disabled).toBe(true);
    type(h.byLabel(S.deletePassword), 'secret');
    await press(h.byLabel(S.deleteForever));
    expect(p.actions.onDeleteAccount).toHaveBeenCalledWith('secret');
  });

  it('"Sign out instead" opens the Sign out page; Back goes to Account', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...make({ exitMenu: {} })} />);
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.moreOptions));
    await press(h.byLabel(S.deleteAccount));
    await press(h.byLabel(`${S.deleteBreakTitle} ${S.deleteBreakAction}`));
    expect(h.has(S.stayIn)).toBe(true);
    await press(h.byLabel(S.back));
    expect(h.has(S.moreOptions)).toBe(true);
  });

  it('parents and typed word rules', () => {
    expect(parentOf('signOut')).toBe('account');
    expect(parentOf('deleteAccount')).toBe('account');
    expect(typedWordMatches(' Delete ', 'DELETE')).toBe(true);
    expect(typedWordMatches('DELET', 'DELETE')).toBe(false);
    expect(typedWordMatches('', '')).toBe(false);
  });
});

describe('top (7.17.0)', () => {
  const count = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => n.props.testID === 'top').length;
  it('draws on the main list only by default', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...make()} top={<View testID="top" />} />);
    expect(count(h)).toBeGreaterThan(0);
    await press(h.byLabel(S.account));
    expect(count(h)).toBe(0);
  });
  it('with topOnEveryPage and a function, draws per page', async () => {
    const seen: string[] = [];
    const h = mount(<SettingsScreen theme={THEME} {...make()} topOnEveryPage top={(page) => { seen.push(page); return <View testID="top" />; }} />);
    await press(h.byLabel(S.account));
    expect(count(h)).toBeGreaterThan(0);
    expect(seen).toContain('hub');
    expect(seen).toContain('account');
  });
});

describe('Delete steps stay fixed once started (7.29.0)', () => {
  const unlockPage = () => make({ exitMenu: { unlock: (done) => <View accessibilityLabel="unlock-now" onPress={done} /> } });
  const open = async (h: ReturnType<typeof mount>) => {
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.moreOptions));
    await press(h.byLabel(S.deleteAccount));
  };
  const barLabel = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => typeof n.type === 'string' && String(n.props.accessibilityLabel ?? '').startsWith('Step'))[0]?.props.accessibilityLabel;

  it('unlock taken away on the unlock step: the type-DELETE step still comes next, and the bar keeps its count', async () => {
    const p = unlockPage();
    const h = mount(<SettingsScreen theme={THEME} {...p} />);
    await open(h);
    expect(h.has('unlock-now')).toBe(true);
    expect(barLabel(h)).toBe(S.stepOf(1, 3));
    h.rerender(<SettingsScreen theme={THEME} {...p} exitMenu={{}} />);
    expect(h.has(S.deleteTypeLabel('DELETE'))).toBe(true);
    expect(h.has(S.deleteForever)).toBe(false);
    expect(barLabel(h)).toBe(S.stepOf(2, 3));
    expect(barLabel(h)).not.toBe(S.stepOf(0, 2));
  });

  it('unlock passed only after the page opened: no step is added part way', async () => {
    const p = make({ exitMenu: {} });
    const h = mount(<SettingsScreen theme={THEME} {...p} />);
    await open(h);
    expect(barLabel(h)).toBe(S.stepOf(1, 2));
    h.rerender(<SettingsScreen theme={THEME} {...unlockPage()} />);
    expect(h.has(S.deleteTypeLabel('DELETE'))).toBe(true);
    expect(barLabel(h)).toBe(S.stepOf(1, 2));
  });
});

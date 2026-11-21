import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../src/SettingsScreen';
import { placeMenu } from '../src/logic/menuPlace';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { PickerRow } from '../src/ui/PickerRow';
import { THEME } from './helpers/theme';
import { mount, press } from './helpers/render';

const shows = (h: ReturnType<typeof mount>, text: string) => h.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === text).length > 0;

const make = (over: Partial<SettingsScreenProps> = {}): SettingsScreenProps => ({
  onBack: vi.fn(),
  profile: { name: 'Sam', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  about: { appName: 'My App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: true, onSignOut: vi.fn(async () => {}), onDeleteAccount: vi.fn(async () => {}) },
  ...over,
});

describe('placeMenu (7.26.0)', () => {
  const screen = { width: 390, height: 844 };
  const menu = { width: 250, height: 150 };
  it('sits under the row, right edges lined up', () => {
    expect(placeMenu({ x: 16, y: 200, width: 358, height: 50 }, menu, screen)).toEqual({ top: 256, left: 112 });
  });
  it('flips above the row near the bottom of the screen', () => {
    expect(placeMenu({ x: 16, y: 760, width: 358, height: 50 }, menu, screen).top).toBe(760 - 6 - 150);
  });
  it('stays on screen and centres with no row', () => {
    const p = placeMenu(null, menu, screen);
    expect(p.left).toBe(70);
    expect(p.top).toBeGreaterThan(0);
  });
});

describe('pull-down pickers (7.26.0)', () => {
  const options = [{ value: 0, label: 'Immediately' }, { value: 30, label: '30 s' }];
  const screen = (onChange = vi.fn()) => {
    const extra = { id: 'sec', label: 'Security', icon: 'lock' as const, content: <PickerRow icon="clock" tint="#000000" label="Lock after" options={options} value={0} onChange={onChange} /> };
    return { onChange, h: mount(<SettingsScreen theme={THEME} pickers="pullDown" {...make({ extraPages: [extra] })} />) };
  };
  it('opens a menu with a tick on the chosen line, and picking calls onChange', async () => {
    const { h, onChange } = screen();
    await press(h.byLabel('Security'));
    await press(h.byLabel('Lock after'));
    const lines = h.root.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'menuitem');
    expect(lines.map((l) => l.props.accessibilityState.selected)).toEqual([true, false]);
    await press(h.byLabel('30 s'));
    expect(onChange).toHaveBeenCalledWith(30);
    expect(h.root.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'menuitem')).toHaveLength(0);
  });
  it('picking the same line changes nothing', async () => {
    const { h, onChange } = screen();
    await press(h.byLabel('Security'));
    await press(h.byLabel('Lock after'));
    await press(h.byLabel('Immediately'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('exitMenu.signOutMenu and deleteOnAccess (7.26.0)', () => {
  const exit = { place: 'page' as const, signOutOnAccount: true, signOutMenu: true, deleteOnAccess: true, losses: ['Every piece'] };
  it('Sign out opens a small menu; Stay does nothing, Sign out signs out', async () => {
    const p = make({ exitMenu: exit });
    const h = mount(<SettingsScreen theme={THEME} {...p} />);
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.signOut));
    expect(shows(h, S.signOutBody)).toBe(true);
    await press(h.byLabel(S.stayIn));
    expect(p.actions.onSignOut).not.toHaveBeenCalled();
    await press(h.byLabel(S.signOut));
    const menuLine = h.root.root.findAll((n) => n.props.accessibilityRole === 'menuitem' && n.props.accessibilityLabel === S.signOut)[0]!;
    await press(menuLine);
    expect(p.actions.onSignOut).toHaveBeenCalledTimes(1);
  });
  it('the group page shows the delete steps straight away', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...make({ exitMenu: exit })} />);
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.access));
    expect(shows(h, S.deleteLoseTitle)).toBe(true);
    expect(shows(h, S.accessNote)).toBe(false);
    await press(h.byLabel(S.keepAccount));
    expect(h.has(S.access)).toBe(true);
  });
  it('the Delete account row has the user-x icon, not a second log-out (7.27.1)', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...make({ exitMenu: exit })} />);
    await press(h.byLabel(S.account));
    const icons = h.root.root.findAll((n) => typeof n.props.name === 'string' && ['log-out', 'user-x'].includes(n.props.name)).map((n) => n.props.name);
    expect(icons).toContain('user-x');
    expect(new Set(icons)).toEqual(new Set(['log-out', 'user-x']));
  });
});

describe('group headings (7.26.0)', () => {
  it('are drawn only when the app names them', async () => {
    const strings = { profileGroup: 'Profile', exitGroup: 'Sign-in', aboutAppGroup: 'App', aboutHelpGroup: 'Help', aboutInfoGroup: 'App info' };
    const h = mount(<SettingsScreen theme={THEME} strings={strings} {...make({ exitMenu: { place: 'page', signOutOnAccount: true } })} />);
    await press(h.byLabel(S.account));
    expect(shows(h, 'Profile')).toBe(true);
    expect(shows(h, 'Sign-in')).toBe(true);
    const plain = mount(<SettingsScreen theme={THEME} {...make()} />);
    await press(plain.byLabel(S.account));
    expect(shows(plain, 'Profile')).toBe(false);
  });
});

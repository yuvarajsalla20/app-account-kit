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

describe('placeMenu (7.32.0: opens over the row)', () => {
  const screen = { width: 390, height: 844 };
  const menu = { width: 250, height: 150 };
  it('covers the row and grows upward, bottom edges and right edges lined up', () => {
    expect(placeMenu({ x: 16, y: 400, width: 358, height: 50 }, menu, screen)).toEqual({ top: 450 - 150, left: 112 });
  });
  it('grows downward from the row top when there is no room above', () => {
    expect(placeMenu({ x: 16, y: 120, width: 358, height: 50 }, menu, screen).top).toBe(120);
  });
  it('never runs off the bottom', () => {
    const tall = { width: 250, height: 700 };
    expect(placeMenu({ x: 16, y: 300, width: 358, height: 50 }, tall, screen).top).toBe(844 - 700 - 12);
  });
  it('stays on screen and centres with no row', () => {
    const p = placeMenu(null, menu, screen);
    expect(p.left).toBe(70);
    expect(p.top).toBeGreaterThan(0);
  });
});

describe('PullDownMenu lines (7.32.0)', () => {
  it('draws a lead icon or a dot, a padlock on a locked line, and says it is locked', async () => {
    const { PullDownMenu } = await import('../src/ui/PullDown');
    const { AccountProvider } = await import('../src/context');
    const items = [
      { id: 'a', label: 'Daily', lead: 'sun' as const, checked: true },
      { id: 'b', label: 'Work', dot: '#1d4ed8' },
      { id: 'c', label: 'Chime', locked: true, group: true },
    ];
    const h = mount(<AccountProvider theme={THEME}><PullDownMenu anchor={null} items={items} onPick={() => {}} onClose={() => {}} /></AccountProvider>);
    const lines = h.root.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'menuitem');
    expect(lines.map((l) => l.props.accessibilityLabel)).toEqual(['Daily', 'Work', `Chime, ${S.lockedHint}`]);
    expect(lines.map((l) => l.props.accessibilityState.selected)).toEqual([true, false, false]);
  });
});

describe('pull-down PickerRow with paid options (7.33.0)', () => {
  const options = [{ value: 'Bell', label: 'Bell' }, { value: 'Chime', label: 'Chime' }, { value: 'Harp', label: 'Harp' }];
  const open = async () => {
    const onChange = vi.fn();
    const onPick = vi.fn();
    const onLocked = vi.fn();
    const extra = { id: 'sec', label: 'Alerts', icon: 'bell' as const, content: <PickerRow icon="volume-2" tint="#000000" label="Default Sound" note="Plays when picked." options={options} value="Bell" onChange={onChange} onPick={onPick} locked={(v) => v !== 'Bell'} onLocked={onLocked} /> };
    const h = mount(<SettingsScreen theme={THEME} pickers="pullDown" {...make({ extraPages: [extra] })} />);
    await press(h.byLabel('Alerts'));
    await press(h.byLabel('Default Sound'));
    return { h, onChange, onPick, onLocked };
  };
  it('shows the note and a padlock on each paid option', async () => {
    const { h } = await open();
    expect(shows(h, 'Plays when picked.')).toBe(true);
    const lines = h.root.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'menuitem');
    expect(lines.map((l) => l.props.accessibilityLabel)).toEqual(['Bell', `Chime, ${S.lockedHint}`, `Harp, ${S.lockedHint}`]);
  });
  it('a paid option plays, is not kept, and calls onLocked with it', async () => {
    const { h, onChange, onPick, onLocked } = await open();
    await press(h.root.root.findAll((n) => n.props.accessibilityRole === 'menuitem' && n.props.accessibilityLabel === `Chime, ${S.lockedHint}`)[0]!);
    expect(onPick).toHaveBeenCalledWith('Chime');
    expect(onLocked).toHaveBeenCalledWith('Chime');
    expect(onChange).not.toHaveBeenCalled();
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
    // 7.28.0: the page itself is called Profile now, so check a heading the page title cannot be.
    expect(shows(plain, 'Sign-in')).toBe(false);
  });
});

describe('Profile is the word (7.28.0)', () => {
  it('names the row and page Profile, with no Account anywhere on the list or page', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...make()} />);
    expect(shows(h, 'Profile')).toBe(true);
    expect(shows(h, 'Account')).toBe(false);
    await press(h.byLabel('Profile'));
    expect(shows(h, 'Account')).toBe(false);
  });
});

describe('frosted, easy-to-read menus (8.0.0)', () => {
  it('menuFill: the card color, at 92% over a blur and solid without one', async () => {
    const { menuFill, MENU_GLASS } = await import('../src/ui/color');
    expect(MENU_GLASS).toBe(0.92);
    expect(menuFill('#ffffff', '#f0f0f0', true)).toBe('#ffffffeb');
    expect(menuFill('#0f1d1b', '#0f1d1b', false)).toBe('#0f1d1b');
    // A see-through card color falls back to the panel color, so the menu never shows the rows beneath.
    expect(menuFill('rgba(255,255,255,0.4)', '#fafafa', false)).toBe('#fafafa');
    expect(menuFill('rgba(255,255,255,0.4)', '#fafafa', true)).toBe('#fafafaeb');
  });

  const layers = async (os: string, menu?: string) => {
    const RN = await import('react-native');
    const before = RN.Platform.OS;
    (RN.Platform as { OS: string }).OS = os;
    try {
      const { PullDownMenu } = await import('../src/ui/PullDown');
      const { AccountProvider } = await import('../src/context');
      const Backdrop = vi.fn((_: { style: object; intensity?: number }) => null);
      const h = mount(
        <AccountProvider theme={{ ...THEME, surface: '#ffffff', ...(menu ? { menu } : {}) }} components={{ MenuBackdrop: Backdrop }}>
          <PullDownMenu anchor={null} items={[{ id: 'a', label: 'At Time' }]} onPick={() => {}} onClose={() => {}} />
        </AccountProvider>,
      );
      const fills = h.root.root.findAll((n) => typeof n.type === 'string' && [n.props.style].flat(3).some((s) => s && typeof s === 'object' && 'backgroundColor' in s && /^#ffffff/.test(String(s.backgroundColor))));
      return { Backdrop, fills: fills.map((n) => [n.props.style].flat(3).find((s) => s && 'backgroundColor' in s)!.backgroundColor) };
    } finally {
      (RN.Platform as { OS: string }).OS = before;
    }
  };

  it('iPhone: a strong blur under the card color at 92%, whatever theme.menu says', async () => {
    const { Backdrop, fills } = await layers('ios', 'rgba(246,251,250,0.2)');
    expect(Backdrop).toHaveBeenCalled();
    expect(Backdrop.mock.calls[0]![0].intensity).toBe(90);
    expect(fills).toContain('#ffffffeb');
  });

  it('Android: no blur, a solid card color', async () => {
    const { Backdrop, fills } = await layers('android');
    expect(Backdrop).not.toHaveBeenCalled();
    expect(fills).toContain('#ffffff');
  });
});

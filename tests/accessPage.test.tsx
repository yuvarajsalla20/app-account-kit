import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../src/hub/SettingsScreen';
import { parentOf } from '../src/hub/pages';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { THEME } from './helpers/theme';
import { mount, press } from './helpers/render';

/** True when some text on screen reads exactly this. */
const shows = (h: ReturnType<typeof mount>, text: string) => h.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === text).length > 0;

const make = (over: Partial<SettingsScreenProps> = {}): SettingsScreenProps => ({
  onBack: vi.fn(),
  profile: { name: 'Sam', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  about: { appName: 'My App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: true, onSignOut: vi.fn(async () => {}), onDeleteAccount: vi.fn(async () => {}) },
  ...over,
});

describe("exitMenu.place 'page' (7.24.0)", () => {
  it('Account has an Access row and no ⋯; Access lists Sign out and Delete account', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...make({ exitMenu: { place: 'page' } })} />);
    expect(h.has(S.signOut)).toBe(false);
    await press(h.byLabel(S.account));
    expect(h.has(S.moreOptions)).toBe(false);
    await press(h.byLabel(S.access));
    expect(h.has(S.signOut)).toBe(true);
    expect(h.has(S.deleteAccount)).toBe(true);
    expect(shows(h, S.accessNote)).toBe(true);
  });

  it('Sign out from Access keeps its confirm page; Stay and Back return to Access, then Account', async () => {
    const p = make({ exitMenu: { place: 'page' } });
    const h = mount(<SettingsScreen theme={THEME} {...p} />);
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.access));
    await press(h.byLabel(S.signOut));
    expect(h.has(S.stayIn)).toBe(true);
    await press(h.byLabel(S.stayIn));
    expect(shows(h, S.accessNote)).toBe(true);
    await press(h.byLabel(S.signOut));
    await press(h.byLabel(S.signOut));
    expect(p.actions.onSignOut).toHaveBeenCalledTimes(1);
    await press(h.byLabel(S.back));
    expect(shows(h, S.accessNote)).toBe(true);
    await press(h.byLabel(S.back));
    expect(h.has(S.access)).toBe(true);
    expect(shows(h, S.accessNote)).toBe(false);
  });

  it('Delete account from Access still starts at "You will lose"', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...make({ exitMenu: { place: 'page', losses: ['Every piece'] } })} />);
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.access));
    await press(h.byLabel(S.deleteAccount));
    expect(shows(h, S.deleteLoseTitle)).toBe(true);
    await press(h.byLabel(S.back));
    expect(shows(h, S.accessNote)).toBe(true);
  });

  it("'menu' (the default) keeps the ⋯ and no Access row", async () => {
    const h = mount(<SettingsScreen theme={THEME} {...make({ exitMenu: { place: 'menu' } })} />);
    await press(h.byLabel(S.account));
    expect(h.has(S.moreOptions)).toBe(true);
    expect(h.has(S.access)).toBe(false);
  });

  it('no Access row when the app has neither action', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...make({ exitMenu: { place: 'page' }, actions: { confirmsWithPassword: true } })} />);
    await press(h.byLabel(S.account));
    expect(h.has(S.access)).toBe(false);
  });

  it('parents', () => {
    expect(parentOf('access')).toBe('account');
    expect(parentOf('signOut', [], [], true)).toBe('access');
    expect(parentOf('deleteAccount', [], [], true)).toBe('access');
    expect(parentOf('signOut')).toBe('account');
  });

  it('signOutOnAccount (7.25.0): Sign out is a row on Account; the group page holds only Delete account', async () => {
    const p = make({ exitMenu: { place: 'page', signOutOnAccount: true, losses: ['Every piece'] }, strings: { access: 'Deactivate' } });
    const h = mount(<SettingsScreen theme={THEME} {...p} />);
    await press(h.byLabel(S.account));
    expect(h.has(S.moreOptions)).toBe(false);
    expect(h.has('Deactivate')).toBe(true);
    await press(h.byLabel(S.signOut));
    expect(h.has(S.stayIn)).toBe(true);
    await press(h.byLabel(S.stayIn));
    expect(h.has('Deactivate')).toBe(true);
    await press(h.byLabel(S.signOut));
    await press(h.byLabel(S.back));
    expect(h.has('Deactivate')).toBe(true);
    await press(h.byLabel('Deactivate'));
    expect(h.has(S.signOut)).toBe(false);
    expect(h.has(S.deleteAccount)).toBe(true);
    await press(h.byLabel(S.deleteAccount));
    expect(shows(h, S.deleteLoseTitle)).toBe(true);
    await press(h.byLabel(S.back));
    expect(h.has(S.deleteAccount)).toBe(true);
    await press(h.byLabel(S.back));
    expect(h.has('Deactivate')).toBe(true);
  });

  it('signOutOnAccount with no delete: only the Sign out row, no group row', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...make({ exitMenu: { place: 'page', signOutOnAccount: true }, actions: { confirmsWithPassword: true, onSignOut: vi.fn(async () => {}) } })} />);
    await press(h.byLabel(S.account));
    expect(h.has(S.signOut)).toBe(true);
    expect(h.has(S.access)).toBe(false);
  });
});

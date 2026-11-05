import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../src/SettingsScreen';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { calls } from './stubs/react-native';
import { THEME } from './helpers/theme';
import { act, mount, press, type } from './helpers/render';

const props = (over: Partial<SettingsScreenProps> = {}): SettingsScreenProps => ({
  onBack: vi.fn(),
  profile: { name: 'Yuva', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  about: { appName: 'My App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: true, onSignOut: async () => {}, onDeleteAccount: async () => {} },
  ...over,
});
const screen = (p: SettingsScreenProps) => mount(<SettingsScreen theme={THEME} {...p} />);

describe('SettingsScreen', () => {
  it('walks Settings → Account → Change password, saves, and lands back on Account with the message', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    const h = screen(props({ password: { onChange } }));
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.changePassword));
    expect(h.has(S.currentPassword)).toBe(true);
    await type(h.byLabel(S.currentPassword), 'old-password');
    await type(h.byLabel(S.newPassword), 'new-password');
    await type(h.byLabel(S.confirmPassword), 'new-password');
    await press(h.byLabel(S.savePassword));
    expect(onChange).toHaveBeenCalledWith('old-password', 'new-password');
    expect(h.has(S.currentPassword)).toBe(false);
    expect(h.has(S.deleteAccount)).toBe(true);
    expect(calls.announced).toContain(S.passwordChanged);
  });

  it('steps back one page at a time, and hands Back to the app only from the list', async () => {
    const p = props();
    const h = screen(p);
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.back));
    expect(p.onBack).not.toHaveBeenCalled();
    expect(h.has(S.signOut)).toBe(true);
    await press(h.byLabel(S.back));
    expect(p.onBack).toHaveBeenCalledTimes(1);
  });

  it('announces the same message again when the same mistake is made twice', async () => {
    calls.announced.length = 0;
    const h = screen(props({ password: { onChange: async () => {} } }));
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.changePassword));
    await type(h.byLabel(S.currentPassword), 'old-password');
    await type(h.byLabel(S.newPassword), 'new-password');
    await type(h.byLabel(S.confirmPassword), 'other-password');
    await press(h.byLabel(S.savePassword));
    await press(h.byLabel(S.savePassword));
    expect(calls.announced.filter((t) => t === S.passwordProblem('mismatch', 8))).toHaveLength(2);
  });

  it('falls back to the list when the page being shown is no longer offered', async () => {
    const h = screen(props({ password: { onChange: async () => {} } }));
    await press(h.byLabel(S.account));
    await press(h.byLabel(S.changePassword));
    h.rerender(<SettingsScreen theme={THEME} {...props()} />);
    await act(async () => {});
    expect(h.has(S.currentPassword)).toBe(false);
  });
});

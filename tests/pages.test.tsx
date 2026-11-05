import { afterEach, describe, expect, it, vi } from 'vitest';
import { AboutSection } from '../src/sections/AboutSection';
import { AccountPage } from '../src/sections/AccountPage';
import { HubPage } from '../src/sections/HubPage';
import { DataRow } from '../src/sections/profile/DataRow';
import { ProfileHeader } from '../src/sections/profile/ProfileHeader';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { AboutProps, PhotoProps, ProfileInfo } from '../src/types';
import { Linking, Platform, Share } from './stubs/react-native';
import { act, press, withAction } from './helpers/render';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  Platform.OS = 'ios';
});

const profile: ProfileInfo = { name: 'Yuva', fallbackName: 'App', email: 'a@b.com', photo: '' };
const about: AboutProps = { appName: 'My App', version: { number: '1.2.0', label: 'v1.2 · today' }, privacyUrl: 'https://x.y/privacy', supportEmail: 'help@x.com' };

describe('HubPage', () => {
  const setup = (props: { data?: boolean; app?: boolean; onSignOut?: () => Promise<void> | void } = {}) => {
    const onOpen = vi.fn();
    const h = withAction((action) => (
      <HubPage profile={profile} about={about} data={props.data ? { label: 'Download', value: 'CSV', onDownload: async () => {} } : undefined} app={props.app ? { hint: 'Sounds', content: null } : undefined} onSignOut={props.onSignOut} onOpen={onOpen} action={action} />
    ));
    return { ...h, onOpen };
  };

  it('lists only the pages the app has, and opens the one tapped', async () => {
    const h = setup({ data: true });
    expect(h.has(`${S.account}, `) || h.has(S.account)).toBe(true);
    expect(h.has(S.myData)).toBe(true);
    expect(h.has(S.app)).toBe(false);
    await press(h.byLabel(S.about));
    expect(h.onOpen).toHaveBeenCalledWith('about');
  });

  it('shows Sign out only when the app can, and reports a failure', async () => {
    expect(setup().has(S.signOut)).toBe(false);
    const h = setup({ onSignOut: () => Promise.reject(new Error('x')) });
    await press(h.byLabel(S.signOut));
    expect(h.held.action.note).toBe(S.couldNot(S.signOutAction));
  });
});

describe('AccountPage', () => {
  const setup = (password: boolean, email: string | null = 'a@b.com') => {
    const onOpenPassword = vi.fn();
    const h = withAction((action) => (
      <AccountPage profile={{ ...profile, email }} nickname={{ max: 20, onSave: async () => {} }} password={password ? { onChange: async () => {} } : undefined} action={action} onOpenPassword={onOpenPassword} onDeleteAccount={async () => {}} confirmsWithPassword />
    ));
    return { ...h, onOpenPassword };
  };

  it('offers Change password only to people with a password login and an email', async () => {
    expect(setup(false).has(S.changePassword)).toBe(false);
    expect(setup(true, null).has(S.changePassword)).toBe(false);
    const h = setup(true);
    await press(h.byLabel(S.changePassword));
    expect(h.onOpenPassword).toHaveBeenCalledTimes(1);
  });

  it('always has the nickname box and Delete account', () => {
    const h = setup(false);
    expect(h.has(S.nickname)).toBe(true);
    expect(h.has(S.deleteAccount)).toBe(true);
  });
});

describe('DataRow', () => {
  it('runs the download, and blocks a second tap while it works', async () => {
    let release!: () => void;
    const onDownload = vi.fn(() => new Promise<void>((r) => (release = r)));
    const h = withAction((action) => <DataRow label="Download" value="CSV" onDownload={onDownload} action={action} />);
    act(() => void h.byLabel('Download').props.onPress?.());
    await act(async () => {});
    expect(h.held.action.busy).toBe(true);
    expect(h.byLabel('Download').props.disabled).toBe(true);
    await act(async () => release());
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('shows why the download failed', async () => {
    const h = withAction((action) => <DataRow label="Download" onDownload={() => Promise.reject(new Error('x'))} action={action} />);
    await press(h.byLabel('Download'));
    expect(h.held.action.note).toBe(S.couldNot(S.download));
  });
});

describe('ProfileHeader', () => {
  const photo = (over: Partial<PhotoProps> = {}): PhotoProps => ({ pick: vi.fn().mockResolvedValue('data:image/png;base64,AAAA'), onChange: vi.fn().mockResolvedValue(undefined), cameraSupported: true, ...over });
  const setup = (p?: PhotoProps, who: ProfileInfo = profile, timeoutMs?: number) => withAction((action) => <ProfileHeader profile={who} photo={p} action={action} />, { timeoutMs });

  it('has no Change photo link when the app passes no photo support', () => {
    expect(setup().byText(S.changePhoto)).toBeNull();
  });

  it('opens a menu; the camera shows only where it exists, Remove only with a photo', async () => {
    const h = setup(photo({ cameraSupported: false }));
    await press(h.byText(S.changePhoto));
    expect(h.has(S.takePhoto)).toBe(false);
    expect(h.has(S.library)).toBe(true);
    expect(h.has(S.removePhoto)).toBe(false);
    const withPhoto = setup(photo(), { ...profile, photo: 'data:image/png;base64,AAAA' });
    await press(withPhoto.byText(S.changePhoto));
    expect(withPhoto.has(S.removePhoto)).toBe(true);
  });

  it('saves a picked photo', async () => {
    const p = photo();
    const h = setup(p);
    await press(h.byText(S.changePhoto));
    await press(h.byLabel(S.library));
    expect(p.pick).toHaveBeenCalledWith('library');
    expect(p.onChange).toHaveBeenCalledWith('data:image/png;base64,AAAA');
    expect(h.held.action.note).toBeNull();
  });

  it('refuses a photo that is not a small picture', async () => {
    const p = photo({ pick: vi.fn().mockResolvedValue('javascript:alert(1)') });
    const h = setup(p);
    await press(h.byText(S.changePhoto));
    await press(h.byLabel(S.library));
    expect(p.onChange).not.toHaveBeenCalled();
    expect(h.held.action.note).toBe(S.photoInvalid);
  });

  it('says so when access was refused, and leaves the photo alone when the person cancels', async () => {
    const denied = photo({ pick: vi.fn().mockRejectedValue(new Error('permission')) });
    const h = setup(denied);
    await press(h.byText(S.changePhoto));
    await press(h.byLabel(S.library));
    expect(h.held.action.note).toBe(S.photoPermission);
    const cancelled = photo({ pick: vi.fn().mockResolvedValue(null) });
    const c = setup(cancelled);
    await press(c.byText(S.changePhoto));
    await press(c.byLabel(S.library));
    expect(cancelled.onChange).not.toHaveBeenCalled();
    expect(c.held.action.note).toBeNull();
  });

  it('waits as long as the person takes in the picker, with no time limit', async () => {
    vi.useFakeTimers();
    let choose!: (v: string) => void;
    const p = photo({ pick: vi.fn(() => new Promise<string>((r) => (choose = r))) });
    const h = setup(p, profile, 1000);
    await press(h.byText(S.changePhoto));
    act(() => void h.byLabel(S.library).props.onPress());
    await act(async () => void (await vi.advanceTimersByTimeAsync(90_000)));
    expect(h.held.action.note).toBeNull();
    await act(async () => choose('data:image/png;base64,AAAA'));
    expect(p.onChange).toHaveBeenCalledTimes(1);
  });

  it('removes the photo with an empty value', async () => {
    const p = photo();
    const h = setup(p, { ...profile, photo: 'data:image/png;base64,AAAA' });
    await press(h.byText(S.changePhoto));
    await press(h.byLabel(S.removePhoto));
    expect(p.onChange).toHaveBeenCalledWith('');
    expect(p.pick).not.toHaveBeenCalled();
  });
});

describe('AboutSection', () => {
  const setup = (props: Partial<AboutProps> = {}) => withAction((action) => <AboutSection {...about} {...props} action={action} />);

  it('shows Share only for an https link, and Rate only on iPhone with a numeric App Store number', () => {
    expect(setup().has(S.share('My App'))).toBe(false);
    expect(setup({ share: { url: 'http://insecure.example' } }).has(S.share('My App'))).toBe(false);
    expect(setup({ share: { url: 'https://apps.apple.com/app/id1' } }).has(S.share('My App'))).toBe(true);
    expect(setup({ rate: { appStoreId: '6740123456' } }).has(S.rate('My App'))).toBe(true);
    expect(setup({ rate: { appStoreId: 'id6740123456' } }).has(S.rate('My App'))).toBe(false);
    Platform.OS = 'android';
    expect(setup({ rate: { appStoreId: '6740123456' } }).has(S.rate('My App'))).toBe(false);
  });

  it('opens the App Store review screen, and the web page if that fails', async () => {
    const open = vi.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no store')).mockResolvedValue(true);
    const h = setup({ rate: { appStoreId: '6740123456' } });
    await press(h.byLabel(S.rate('My App')));
    expect(open).toHaveBeenNthCalledWith(1, 'itms-apps://itunes.apple.com/app/id6740123456?action=write-review');
    expect(open).toHaveBeenNthCalledWith(2, 'https://apps.apple.com/app/id6740123456?action=write-review');
    expect(h.held.action.note).toBeNull();
  });

  it('shares the message with the link, and waits for the person to finish with the share sheet', async () => {
    vi.useFakeTimers();
    let close!: () => void;
    const share = vi.spyOn(Share, 'share').mockImplementation(() => new Promise((r) => (close = () => r({}))));
    const h = withAction((action) => <AboutSection {...about} share={{ url: 'https://x.y/z' }} action={action} />, { timeoutMs: 1000 });
    act(() => void h.byLabel(S.share('My App')).props.onPress());
    await act(async () => void (await vi.advanceTimersByTimeAsync(60_000)));
    expect(share).toHaveBeenCalledWith({ message: 'Try My App: https://x.y/z' });
    expect(h.held.action.note).toBeNull();
    await act(async () => close());
  });

  it('refuses a privacy link that is not https', async () => {
    const open = vi.spyOn(Linking, 'openURL');
    const h = setup({ privacyUrl: 'http://x.y/privacy' });
    await press(h.byLabel(S.privacy));
    expect(open).not.toHaveBeenCalled();
    expect(h.held.action.note).toBe(S.couldNot(S.openLink));
  });

  it('writes a support email with the version and kits, or tells the person there is no mail app', async () => {
    const open = vi.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const h = setup({ kits: 'core 1.4.0 | auth 1.6.0' });
    await press(h.byLabel(S.contactSupport));
    expect(decodeURIComponent(String(open.mock.calls[0]![0]))).toContain('Kits: core 1.4.0 | auth 1.6.0');
    open.mockRejectedValue(new Error('no mail'));
    await press(h.byLabel(S.contactSupport));
    expect(h.held.action.note).toBe(S.noMail('help@x.com'));
  });

  it('shows the Kits row only when the app passes kits', () => {
    expect(setup().has(S.kits)).toBe(false);
    expect(setup({ kits: 'core 1.4.0' }).has(`${S.kits}`)).toBe(true);
  });
});

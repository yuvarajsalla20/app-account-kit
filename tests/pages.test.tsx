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
import { THEME } from './helpers/theme';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  Platform.OS = 'ios';
});

const profile: ProfileInfo = { name: 'Yuva', fallbackName: 'App', email: 'a@b.com', photo: '' };
const about: AboutProps = { appName: 'My App', version: { number: '1.2.0', label: 'v1.2 · today' }, privacyUrl: 'https://x.y/privacy', supportEmail: 'help@x.com' };

describe('HubPage', () => {
  const setup = (props: { data?: boolean; app?: boolean; onSignOut?: () => Promise<void> | void; onDeleteAccount?: (password: string) => Promise<void> } = {}) => {
    const onOpen = vi.fn();
    const h = withAction((action) => (
      <HubPage data={props.data ? { label: 'Download', formats: [{ id: 'csv', label: 'CSV', onDownload: async () => {} }] } : undefined} app={props.app ? { content: null } : undefined} onSignOut={props.onSignOut} onDeleteAccount={props.onDeleteAccount} confirmsWithPassword={false} onOpen={onOpen} action={action} />
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

  it('shows each row as a name with an arrow only: no email, format, hint or version on the right', () => {
    const h = setup({ data: true, app: true });
    for (const shown of ['a@b.com', 'Yuva', 'CSV', 'Sounds', 'v1.2.0', '1.2.0']) expect(h.has(shown)).toBe(false);
    expect(h.root.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityValue !== undefined)).toHaveLength(0);
    expect([S.account, S.myData, S.app, S.about].every((l) => h.has(l))).toBe(true);
  });

  it('puts Delete account right under Sign out, and only when the app can delete', () => {
    const h = setup({ onSignOut: async () => {}, onDeleteAccount: async () => {} });
    const order = h.root.root.findAll((n) => typeof n.type === 'string' && [S.signOut, S.deleteAccount].includes(String(n.props.accessibilityLabel))).map((n) => n.props.accessibilityLabel);
    expect(order).toEqual([S.signOut, S.deleteAccount]);
    expect(setup({ onSignOut: async () => {} }).has(S.deleteAccount)).toBe(false);
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
      <AccountPage profile={{ ...profile, email }} nickname={{ max: 20, onSave: async () => {} }} password={password ? { onChange: async () => {} } : undefined} action={action} onOpenPassword={onOpenPassword} />
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

  it('always has the nickname box, and Delete account is not here any more', () => {
    const h = setup(false);
    expect(h.has(S.nickname)).toBe(true);
    expect(h.has(S.deleteAccount)).toBe(false);
  });

  it('shows the email as a read-only row under the nickname, labelled like it, and not in the header', () => {
    const h = setup(true);
    expect(h.has(`${S.email}, a@b.com`)).toBe(true);
    const labels = h.root.root.findAll((n) => typeof n.type === 'string' && [S.nickname, `${S.email}, a@b.com`, S.changePassword].includes(String(n.props.accessibilityLabel))).map((n) => n.props.accessibilityLabel);
    expect(labels).toEqual([S.nickname, `${S.email}, a@b.com`, S.changePassword]);
    const row = h.byLabel(`${S.email}, a@b.com`);
    expect(row.findAll((n) => n.type === 'TextInput')).toHaveLength(0);
    expect(row.props.onPress).toBeUndefined();
    expect(h.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === 'a@b.com')).toHaveLength(1);
  });

  it('has no email row for a login without an email', () => {
    expect(setup(false, null).root.root.findAll((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${S.email},`))).toHaveLength(0);
  });
});

describe('DataRow', () => {
  const csv = (onDownload: () => Promise<void>) => ({ id: 'csv', label: 'CSV', onDownload });
  const pdf = (onDownload: () => Promise<void>) => ({ id: 'pdf', label: 'PDF', onDownload });

  it('with one format, shows its name and runs the download on a tap, blocking a second tap while it works', async () => {
    let release!: () => void;
    const onDownload = vi.fn(() => new Promise<void>((r) => (release = r)));
    const h = withAction((action) => <DataRow label="Download" formats={[csv(onDownload)]} action={action} />);
    expect(h.byLabel('Download').props.accessibilityValue).toEqual({ text: 'CSV' });
    expect(h.root.root.findAll((n) => n.type === 'Modal')).toHaveLength(0);
    act(() => void h.byLabel('Download').props.onPress?.());
    await act(async () => {});
    expect(h.held.action.busy).toBe(true);
    expect(h.byLabel('Download').props.disabled).toBe(true);
    await act(async () => release());
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('shows why the download failed', async () => {
    const h = withAction((action) => <DataRow label="Download" formats={[csv(() => Promise.reject(new Error('x')))]} action={action} />);
    await press(h.byLabel('Download'));
    expect(h.held.action.note).toBe(S.couldNot(S.download));
  });

  it('with several formats, a tap opens a sheet and the format picked is the one that runs', async () => {
    const onCsv = vi.fn().mockResolvedValue(undefined);
    const onPdf = vi.fn().mockResolvedValue(undefined);
    const h = withAction((action) => <DataRow label="Download" formats={[csv(onCsv), pdf(onPdf)]} action={action} />);
    expect(h.root.root.findAll((n) => n.type === 'Modal')).toHaveLength(0);
    expect(h.byLabel('Download').props.accessibilityValue).toBeUndefined();
    await press(h.byLabel('Download'));
    expect(h.root.root.findAll((n) => n.type === 'Modal')).toHaveLength(1);
    expect(onCsv).not.toHaveBeenCalled();
    await press(h.byLabel('PDF'));
    expect(onPdf).toHaveBeenCalledTimes(1);
    expect(onCsv).not.toHaveBeenCalled();
    expect(h.root.root.findAll((n) => n.type === 'Modal')).toHaveLength(0);
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
  const texts = (h: ReturnType<typeof setup>) => h.root.root.findAll((n) => typeof n.type === 'string' && typeof n.props.children === 'string').map((n) => n.props.children as string);

  it('shows the app name as the heading and the version small under it, with no Version row', () => {
    const h = setup();
    expect(h.root.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'header' && n.props.children === 'My App')).toHaveLength(1);
    expect(texts(h)).toContain('v1.2 · today');
    const name = h.root.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'header')[0]!;
    expect(name.props.style.color).toBe(THEME.brand); // the app's own color, not the text color
    expect(h.has('Version')).toBe(false);
  });

  it('shows the app picture above the name only when the app passes one', () => {
    expect(setup().root.root.findAll((n) => n.type === 'Image')).toHaveLength(0);
    const logo = { uri: 'https://x.y/logo.png' };
    const found = setup({ logo }).root.root.findAll((n) => n.type === 'Image');
    expect(found).toHaveLength(1);
    expect(found[0]!.props.source).toBe(logo);
    expect(found[0]!.props.accessible).toBe(false);
  });

  it('lists the rows in order: Contact support, Share, Rate, Privacy policy, Kits', () => {
    const h = setup({ share: {}, rate: {}, kits: 'core 1.4.0' });
    const order = h.root.root.findAll((n) => typeof n.type === 'string' && [S.contactSupport, S.share, S.rate, S.privacy, S.kits].includes(String(n.props.accessibilityLabel))).map((n) => n.props.accessibilityLabel);
    expect(order).toEqual([S.contactSupport, S.share, S.rate, S.privacy, S.kits]);
  });

  it('shows Share and Rate whenever the app passes them (Rate on iPhone only), and says so when there is nothing to open yet', async () => {
    expect(setup().has(S.share)).toBe(false);
    expect(setup().has(S.rate)).toBe(false);
    const h = setup({ share: {}, rate: {} });
    expect(h.has(S.share) && h.has(S.rate)).toBe(true);
    await press(h.byLabel(S.share));
    expect(h.held.action.note).toBe(S.notOnStoreYet);
    h.held.action.setNote(null);
    await press(h.byLabel(S.rate));
    expect(h.held.action.note).toBe(S.notOnStoreYet);
    const insecure = setup({ share: { url: 'http://insecure.example' }, rate: { appStoreId: 'id6740123456' } });
    await press(insecure.byLabel(S.share));
    expect(insecure.held.action.note).toBe(S.notOnStoreYet);
    await press(insecure.byLabel(S.rate));
    expect(insecure.held.action.note).toBe(S.notOnStoreYet);
    Platform.OS = 'android';
    expect(setup({ rate: {} }).has(S.rate)).toBe(false);
  });

  it('opens the App Store review screen, and the web page if that fails', async () => {
    const open = vi.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no store')).mockResolvedValue(true);
    const h = setup({ rate: { appStoreId: '6740123456' } });
    await press(h.byLabel(S.rate));
    expect(open).toHaveBeenNthCalledWith(1, 'itms-apps://itunes.apple.com/app/id6740123456?action=write-review');
    expect(open).toHaveBeenNthCalledWith(2, 'https://apps.apple.com/app/id6740123456?action=write-review');
    expect(h.held.action.note).toBeNull();
  });

  it('shares the message with the link, and waits for the person to finish with the share sheet', async () => {
    vi.useFakeTimers();
    let close!: () => void;
    const share = vi.spyOn(Share, 'share').mockImplementation(() => new Promise((r) => (close = () => r({}))));
    const h = withAction((action) => <AboutSection {...about} share={{ url: 'https://x.y/z' }} action={action} />, { timeoutMs: 1000 });
    act(() => void h.byLabel(S.share).props.onPress());
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

  it('opens Contact support in place to show the address, and tapping the address writes the email with the version and kits', async () => {
    const open = vi.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const h = setup({ kits: 'core 1.4.0 | auth 1.6.0' });
    expect(h.has('help@x.com')).toBe(false);
    expect(h.byLabel(S.contactSupport).props.accessibilityState).toMatchObject({ expanded: false });
    await press(h.byLabel(S.contactSupport));
    expect(h.byLabel(S.contactSupport).props.accessibilityState).toMatchObject({ expanded: true });
    expect(open).not.toHaveBeenCalled();
    expect(texts(h)).toContain(S.supportHint);
    await press(h.byLabel('help@x.com'));
    expect(decodeURIComponent(String(open.mock.calls[0]![0]))).toContain('Kits: core 1.4.0 | auth 1.6.0');
    open.mockRejectedValue(new Error('no mail'));
    await press(h.byLabel('help@x.com'));
    expect(h.held.action.note).toBe(S.noMail('help@x.com'));
    await press(h.byLabel(S.contactSupport));
    expect(h.has('help@x.com')).toBe(false);
  });

  it('shows the Kits row only when the app passes kits, and opens it in place with one line per kit', async () => {
    expect(setup().has(S.kits)).toBe(false);
    const h = setup({ kits: 'core 1.4.0 | auth 1.6.0' });
    expect(texts(h)).not.toContain('core 1.4.0');
    await press(h.byLabel(S.kits));
    expect(texts(h)).toEqual(expect.arrayContaining(['core 1.4.0', 'auth 1.6.0']));
    await press(h.byLabel(S.kits));
    expect(texts(h)).not.toContain('core 1.4.0');
  });
});

import { describe, expect, it, vi } from 'vitest';
import { DeleteAccount } from '../src/sections/DeleteAccount';
import { NicknameRow } from '../src/sections/profile/NicknameRow';
import { PasswordPage } from '../src/sections/profile/PasswordPage';
import { DEFAULT_STRINGS as S } from '../src/strings';
import { calls } from './stubs/react-native';
import { act, blur, focused, press, submit, type, withAction } from './helpers/render';

const flush = () => act(async () => {});

describe('PasswordPage', () => {
  const setup = (onChange = vi.fn().mockResolvedValue(undefined), extra: { minLength?: number } = {}) => {
    const onDone = vi.fn();
    const h = withAction((action) => <PasswordPage onChange={onChange} action={action} onDone={onDone} {...extra} />);
    const fill = async (current: string, next: string, confirm: string) => {
      await type(h.byLabel(S.currentPassword), current);
      await type(h.byLabel(S.newPassword), next);
      await type(h.byLabel(S.confirmPassword), confirm);
    };
    return { ...h, onChange, onDone, fill };
  };

  it('keeps Save off until all three boxes have something', async () => {
    const h = setup();
    expect(h.byLabel(S.savePassword).props.disabled).toBe(true);
    await h.fill('old-password', 'new-password', '');
    expect(h.byLabel(S.savePassword).props.disabled).toBe(true);
    await h.fill('old-password', 'new-password', 'new-password');
    expect(h.byLabel(S.savePassword).props.disabled).toBe(false);
  });

  it('explains a problem and does not call the app', async () => {
    const h = setup();
    await h.fill('old-password', 'new-password', 'other-password');
    await press(h.byLabel(S.savePassword));
    expect(h.held.action.note).toBe(S.passwordProblem('mismatch', 8));
    expect(h.onChange).not.toHaveBeenCalled();
  });

  it('asks for 8 characters unless the app says otherwise', async () => {
    const h = setup();
    await h.fill('old-password', 'abcdefg', 'abcdefg');
    await press(h.byLabel(S.savePassword));
    expect(h.held.action.note).toBe(S.passwordProblem('short', 8));
    const lenient = setup(undefined, { minLength: 6 });
    await lenient.fill('old-password', 'abcdef', 'abcdef');
    await press(lenient.byLabel(S.savePassword));
    expect(lenient.onChange).toHaveBeenCalledWith('old-password', 'abcdef');
  });

  it('saves, goes back, and says it was changed', async () => {
    const h = setup();
    await h.fill('old-password', 'new-password', 'new-password');
    await press(h.byLabel(S.savePassword));
    expect(h.onChange).toHaveBeenCalledWith('old-password', 'new-password');
    expect(h.onDone).toHaveBeenCalledTimes(1);
    expect(h.held.action.note).toBe(S.passwordChanged);
    expect(h.held.action.noteGood).toBe(true);
  });

  it('stays on the page and shows the reason when the app refuses', async () => {
    const h = setup(vi.fn().mockRejectedValue(new Error('wrong')));
    await h.fill('old-password', 'new-password', 'new-password');
    await press(h.byLabel(S.savePassword));
    expect(h.onDone).not.toHaveBeenCalled();
    expect(h.held.action.note).toBe(S.couldNot(S.savePassword.toLowerCase()));
    expect(h.held.action.noteGood).toBe(false);
  });

  it('moves from box to box with the keyboard, and saves from the last one', async () => {
    focused.length = 0;
    const h = setup();
    await h.fill('old-password', 'new-password', 'new-password');
    await submit(h.byLabel(S.currentPassword));
    await submit(h.byLabel(S.newPassword));
    expect(focused).toEqual([S.newPassword, S.confirmPassword]);
    await submit(h.byLabel(S.confirmPassword));
    expect(h.onChange).toHaveBeenCalledTimes(1);
  });
});

describe('DeleteAccount', () => {
  const setup = (props: { confirmsWithPassword: boolean; onDeleteAccount?: (p: string) => Promise<void> }) => {
    const onReveal = vi.fn();
    const onDeleteAccount = props.onDeleteAccount ?? vi.fn().mockResolvedValue(undefined);
    const ui = (reveal = onReveal) => withAction((action) => <DeleteAccount onDeleteAccount={onDeleteAccount} confirmsWithPassword={props.confirmsWithPassword} action={action} onReveal={reveal} />);
    return { ...ui(), onReveal, onDeleteAccount };
  };

  it('shows nothing when the app cannot delete', () => {
    const h = withAction((action) => <DeleteAccount confirmsWithPassword={false} action={action} />);
    expect(h.has(S.deleteAccount)).toBe(false);
  });

  it('opens a panel only after the first tap, then scrolls to it and moves focus there once', async () => {
    calls.focused = 0;
    const h = setup({ confirmsWithPassword: false });
    expect(h.has(S.deleteEverything)).toBe(false);
    await press(h.byLabel(S.deleteAccount));
    expect(h.has(S.deleteEverything)).toBe(true);
    expect(h.onReveal).toHaveBeenCalledTimes(1);
    expect(calls.focused).toBe(1);
  });

  it('does not pull focus back when the page hands it a new scroll function', async () => {
    calls.focused = 0;
    const reveals: Array<() => void> = [];
    // a fresh function on every render, as the screen creates one each time it re-renders
    const h = withAction((action) => <DeleteAccount onDeleteAccount={async () => {}} confirmsWithPassword={false} action={action} onReveal={() => void reveals.push(() => {})} />);
    await press(h.byLabel(S.deleteAccount));
    expect(calls.focused).toBe(1);
    expect(reveals).toHaveLength(1);
    act(() => h.held.action.setNote('Something else happened.'));
    await flush();
    expect(h.has(S.deleteEverything)).toBe(true); // still the same open panel, not a fresh one
    expect(calls.focused).toBe(1);
    expect(reveals).toHaveLength(1);
  });

  it('needs the password typed when the login has one, and sends it', async () => {
    const h = setup({ confirmsWithPassword: true });
    await press(h.byLabel(S.deleteAccount));
    expect(h.byLabel(S.deleteEverything).props.disabled).toBe(true);
    await type(h.byLabel(S.deletePassword), 'secret-pass');
    expect(h.byLabel(S.deleteEverything).props.disabled).toBe(false);
    await press(h.byLabel(S.deleteEverything));
    expect(h.onDeleteAccount).toHaveBeenCalledWith('secret-pass');
  });

  it('does not ask for a password when Apple or Google confirms', async () => {
    const h = setup({ confirmsWithPassword: false });
    await press(h.byLabel(S.deleteAccount));
    expect(h.has(S.deletePassword)).toBe(false);
    expect(h.byLabel(S.deleteEverything).props.disabled).toBe(false);
  });

  it('keeps the panel and shows the reason when the delete fails', async () => {
    const h = setup({ confirmsWithPassword: false, onDeleteAccount: vi.fn().mockRejectedValue(new Error('no')) });
    await press(h.byLabel(S.deleteAccount));
    await press(h.byLabel(S.deleteEverything));
    expect(h.has(S.deleteEverything)).toBe(true);
    expect(h.held.action.note).toBe(S.couldNot(S.deleteAccount.toLowerCase()));
  });

  it('closes on "keep my account", forgets the password and clears the message', async () => {
    const h = setup({ confirmsWithPassword: true });
    await press(h.byLabel(S.deleteAccount));
    await type(h.byLabel(S.deletePassword), 'secret-pass');
    act(() => h.held.action.setNote('Old message.'));
    await press(h.byLabel(S.keepAccount));
    expect(h.has(S.deleteEverything)).toBe(false);
    expect(h.held.action.note).toBeNull();
    await press(h.byLabel(S.deleteAccount));
    expect(h.byLabel(S.deletePassword).props.value).toBe('');
  });
});

describe('NicknameRow', () => {
  const setup = (saved = 'Yuva', onSave = vi.fn().mockResolvedValue(undefined)) => {
    const h = withAction((action) => <NicknameRow saved={saved} max={6} onSave={onSave} action={action} />);
    return { ...h, onSave, box: () => h.byLabel(S.nickname) };
  };

  it('saves a new name once, even when blur and Done both fire', async () => {
    const h = setup();
    await type(h.box(), '  Yuvaraj  ');
    await submit(h.box());
    await blur(h.box());
    expect(h.onSave).toHaveBeenCalledTimes(1);
    expect(h.onSave).toHaveBeenCalledWith('Yuvara');
    expect(h.box().props.value).toBe('Yuvara');
    expect(h.held.action.note).toBe(S.nicknameSaved);
    expect(h.held.action.noteGood).toBe(true);
  });

  it('does not save a name that has not changed', async () => {
    const h = setup();
    await blur(h.box());
    expect(h.onSave).not.toHaveBeenCalled();
  });

  it('keeps what was typed when the save fails, says why, and tries again on the next blur', async () => {
    const onSave = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
    const h = setup('Yuva', onSave);
    await type(h.box(), 'Nova');
    await blur(h.box());
    expect(h.box().props.value).toBe('Nova');
    expect(h.held.action.note).toBe(S.couldNot(S.saveNickname));
    await blur(h.box());
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(h.held.action.note).toBe(S.nicknameSaved);
  });

  it('saves what is typed when the page closes before the box is left', async () => {
    const h = setup();
    await type(h.box(), 'Nova');
    await h.unmount();
    expect(h.onSave).toHaveBeenCalledWith('Nova');
  });

  it('shows a new saved name handed in by the app', async () => {
    const onSave = vi.fn();
    const h = setup('Yuva', onSave);
    h.rerender(<NicknameRow saved="Nova" max={6} onSave={onSave} action={h.held.action} />);
    await flush();
    expect(h.box().props.value).toBe('Nova');
  });
});

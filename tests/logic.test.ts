import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { KIT_NAME, KIT_VERSION } from '../src/kit';
import { hubPages, parentOf } from '../src/logic/pages';
import { kitLines, kitsLine } from '../src/logic/kits';
import { csvFileName, toCsv } from '../src/logic/csv';
import { canConfirmDelete } from '../src/logic/deleteRules';
import { supportMailUrl } from '../src/logic/mail';
import { cleanNickname, initialOf } from '../src/logic/nickname';
import { MIN_PASSWORD, passwordProblem } from '../src/logic/password';
import { canRate, reviewUrl, reviewWebUrl } from '../src/logic/rate';
import { buildShareMessage, canShare } from '../src/logic/share';
import { DEFAULT_STRINGS } from '../src/strings';

describe('nickname', () => {
  it('trims and cuts to the longest allowed', () => {
    expect(cleanNickname('  Yuvaraj  ', 20)).toBe('Yuvaraj');
    expect(cleanNickname('abcdefghij', 4)).toBe('abcd');
  });

  it('takes the initial from the nickname, then the email, then the fallback', () => {
    expect(initialOf('yuva', 'a@b.com')).toBe('Y');
    expect(initialOf('  ', 'a@b.com')).toBe('A');
    expect(initialOf('', null)).toBe('?');
    expect(initialOf('', null, 'T')).toBe('T');
  });
});

describe('toCsv', () => {
  it('joins rows and quotes commas, quotes and new lines', () => {
    expect(toCsv([['Name', 'Note'], ['Rent', 'Pay, then "relax"\nok']])).toBe('Name,Note\nRent,"Pay, then ""relax""\nok"');
  });

  it('neutralises formulas', () => {
    expect(toCsv([['=SUM(A1)', '-1+2', '+cmd', '@x', 'fine']])).toBe("'=SUM(A1),'-1+2,'+cmd,'@x,fine");
  });

  it('is empty for no rows', () => {
    expect(toCsv([])).toBe('');
  });

  it('makes file-safe names', () => {
    expect(csvFileName('Hring Nring', 'reminders')).toBe('hringnring-reminders.csv');
  });
});

describe('share', () => {
  it('uses the default wording, or the app message with the link added', () => {
    expect(buildShareMessage(DEFAULT_STRINGS.shareMessage, 'App', 'https://x.y/z')).toBe('Try App: https://x.y/z');
    expect(buildShareMessage(DEFAULT_STRINGS.shareMessage, 'App', 'https://x.y/z', ' Come try it. ')).toBe('Come try it. https://x.y/z');
  });

  it('only shares a real web address', () => {
    expect(canShare('https://apps.apple.com/app/id1')).toBe(true);
    expect(canShare('')).toBe(false);
    expect(canShare(undefined)).toBe(false);
    expect(canShare('not a link')).toBe(false);
    expect(canShare('http://insecure.example')).toBe(false);
  });
});

describe('change password', () => {
  const ok = { current: 'old-pass', next: 'new-pass', confirm: 'new-pass' };

  it('accepts a valid change', () => {
    expect(passwordProblem(ok)).toBeNull();
  });

  it('asks for the current password first, then length, difference and match', () => {
    expect(passwordProblem({ ...ok, current: '' })).toBe('current');
    expect(passwordProblem({ ...ok, next: 'abc', confirm: 'abc' })).toBe('short');
    expect(passwordProblem({ ...ok, next: 'old-pass', confirm: 'old-pass' })).toBe('same');
    expect(passwordProblem({ ...ok, confirm: 'other-pass' })).toBe('mismatch');
  });

  it('uses the app minimum when given, otherwise 8 like app-auth-kit', () => {
    expect(MIN_PASSWORD).toBe(8);
    expect(passwordProblem({ ...ok, next: 'abcdefg', confirm: 'abcdefg' })).toBe('short');
    expect(passwordProblem({ ...ok, next: 'abcdef', confirm: 'abcdef', min: 6 })).toBeNull();
  });

  it('has plain words for every problem', () => {
    for (const p of ['current', 'short', 'same', 'mismatch'] as const) expect(DEFAULT_STRINGS.passwordProblem(p, 6).length).toBeGreaterThan(0);
    expect(DEFAULT_STRINGS.passwordProblem('short', 8)).toContain('8');
  });
});

describe('rate', () => {
  it('only shows for a numeric App Store number', () => {
    expect(canRate('6740123456')).toBe(true);
    expect(canRate(' 6740123456 ')).toBe(true);
    expect(canRate('')).toBe(false);
    expect(canRate(undefined)).toBe(false);
    expect(canRate('id6740123456')).toBe(false);
    expect(canRate('https://apps.apple.com/app/id1')).toBe(false);
  });

  it('opens the App Store review screen, with a web fallback', () => {
    expect(reviewUrl('6740123456')).toBe('itms-apps://itunes.apple.com/app/id6740123456?action=write-review');
    expect(reviewWebUrl('6740123456')).toBe('https://apps.apple.com/app/id6740123456?action=write-review');
  });
});

describe('kit version', () => {
  it('matches package.json, so it cannot drift', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(KIT_VERSION).toBe(pkg.version);
    expect(KIT_NAME).toBe(pkg.name);
  });

  it('builds one line of every kit in use', () => {
    expect(kitsLine({ core: '1.4.0', auth: '2.1.0', account: '4.0.1' })).toBe('core 1.4.0 | auth 2.1.0 | account 4.0.1');
    expect(kitsLine({})).toBe('');
    expect(kitLines('core 1.4.0 | auth 2.1.0')).toEqual(['core 1.4.0', 'auth 2.1.0']);
    expect(kitLines('')).toEqual([]);
  });
});

describe('supportMailUrl', () => {
  it('fills in the app, version and device', () => {
    const url = supportMailUrl({ email: 'help@x.com', appName: 'My App', versionNumber: '1.2.0', device: 'ios 18' });
    expect(url.startsWith('mailto:help@x.com?subject=')).toBe(true);
    expect(decodeURIComponent(url)).toContain('My App 1.2.0 support');
    expect(decodeURIComponent(url)).toContain('My App 1.2.0 · ios 18');
    expect(decodeURIComponent(url)).not.toContain('Kits:');
    expect(decodeURIComponent(supportMailUrl({ email: 'h@x.com', appName: 'A', versionNumber: '1', device: 'ios', kits: 'core 1.0.0' }))).toContain('Kits: core 1.0.0');
  });
});

describe('canConfirmDelete', () => {
  it('needs the password only when the login has one, and never while busy', () => {
    expect(canConfirmDelete({ busy: false, confirmsWithPassword: true, password: '' })).toBe(false);
    expect(canConfirmDelete({ busy: false, confirmsWithPassword: true, password: 'x' })).toBe(true);
    expect(canConfirmDelete({ busy: false, confirmsWithPassword: false, password: '' })).toBe(true);
    expect(canConfirmDelete({ busy: true, confirmsWithPassword: false, password: '' })).toBe(false);
  });
});

describe('logic entry', () => {
  it('exposes the pure functions without React Native', async () => {
    const logic = await import('../src/logic');
    expect(Object.keys(logic).sort()).toEqual(['CSV_BOM', 'DEFAULT_ACTION_TIMEOUT_MS', 'DEFAULT_PHOTO_MAX_CHARS', 'MIN_PASSWORD', 'buildShareMessage', 'canConfirmDelete', 'canRate', 'canShare', 'cleanNickname', 'createActionGuard', 'createSaveTracker', 'csvFileName', 'hubPages', 'initialOf', 'isEmail', 'isHttps', 'isPermissionError', 'kitLines', 'kitListLines', 'kitsLine', 'kitsMailLine', 'parentOf', 'passwordProblem', 'reviewUrl', 'reviewWebUrl', 'safePhoto', 'supportMailUrl', 'themeContrast', 'toCsv']);
  });
});

describe('settings pages', () => {
  it('goes back one level, and the hub hands back to the app', () => {
    expect(parentOf('hub')).toBeNull();
    expect(parentOf('account')).toBe('hub');
    expect(parentOf('about')).toBe('hub');
    expect(parentOf('password')).toBe('account');
    expect(parentOf('export')).toBe('hub');
    expect(parentOf('export', ['export'])).toBe('account');
  });

  it('lists only the pages the app has, Account first and About last', () => {
    expect(hubPages({ data: true, app: true })).toEqual(['account', 'data', 'app', 'about']);
    expect(hubPages({ data: false, app: false })).toEqual(['account', 'about']);
  });

  it('follows the order the app gives', () => {
    expect(hubPages({ data: true, app: true }, ['app', 'account', 'data', 'about'])).toEqual(['app', 'account', 'data', 'about']);
  });

  it('puts pages the app left out after the listed ones, and skips pages it does not have', () => {
    expect(hubPages({ data: true, app: true }, ['about', 'app'])).toEqual(['about', 'app', 'account', 'data']);
    expect(hubPages({ data: false, app: true }, ['data', 'app', 'account', 'about'])).toEqual(['app', 'account', 'about']);
  });

  it('adds extra pages before About, and keeps them where the app puts them', () => {
    expect(hubPages({ data: true, app: true }, undefined, ['premium'])).toEqual(['account', 'data', 'app', 'premium', 'about']);
    expect(hubPages({ data: true, app: true }, ['app', 'premium', 'account'], ['premium'])).toEqual(['app', 'premium', 'account', 'data', 'about']);
    expect(hubPages({ data: true, app: true }, ['premium'])).toEqual(['account', 'data', 'app', 'about']);
  });

  it('ignores repeats and unknown names', () => {
    expect(hubPages({ data: true, app: true }, ['app', 'app', 'nope' as never])).toEqual(['app', 'account', 'data', 'about']);
  });
});

describe('csv and nicknames, review fixes', () => {
  it('quotes a value with a carriage return, so a row cannot split', () => {
    expect(toCsv([['a\rb', 'c']])).toBe('"a\rb",c');
  });

  it('cuts a nickname by whole characters, never inside an emoji', () => {
    expect(cleanNickname('ab😀cd', 3)).toBe('ab😀');
  });
});

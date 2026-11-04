import { describe, expect, it } from 'vitest';
import { csvFileName, toCsv } from '../src/logic/csv';
import { canConfirmDelete } from '../src/logic/deleteRules';
import { supportMailUrl } from '../src/logic/mail';
import { cleanNickname, initialOf } from '../src/logic/nickname';
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
    expect(toCsv([['=SUM(A1)', '+1', '-1', '@x', 'fine']])).toBe("'=SUM(A1),'+1,'-1,'@x,fine");
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
  });
});

describe('supportMailUrl', () => {
  it('fills in the app, version and device', () => {
    const url = supportMailUrl({ email: 'help@x.com', appName: 'My App', versionNumber: '1.2.0', device: 'ios 18' });
    expect(url.startsWith('mailto:help@x.com?subject=')).toBe(true);
    expect(decodeURIComponent(url)).toContain('My App 1.2.0 support');
    expect(decodeURIComponent(url)).toContain('My App 1.2.0 · ios 18');
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

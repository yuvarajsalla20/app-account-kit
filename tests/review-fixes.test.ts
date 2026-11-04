import { describe, expect, it, vi } from 'vitest';
import { CSV_BOM, csvFileName, toCsv } from '../src/logic/csv';
import { createActionGuard } from '../src/logic/actionGuard';
import { isEmail, isHttps } from '../src/logic/links';
import { supportMailUrl } from '../src/logic/mail';
import { initialOf } from '../src/logic/nickname';
import { isPermissionError, safePhoto } from '../src/logic/photo';
import { createSaveTracker } from '../src/logic/saveTracker';

describe('csv', () => {
  it('keeps plain numbers as numbers, including negatives', () => {
    expect(toCsv([['-12.50', '+3', '-0.5', '.5', '7']])).toBe('-12.50,+3,-0.5,.5,7');
  });
  it('still marks anything that could run as a formula', () => {
    expect(toCsv([['-1+2', '=1+1', '@SUM', '+cmd|x', '-']])).toBe("'-1+2,'=1+1,'@SUM,'+cmd|x,'-");
  });
  it('adds the Excel marker only when asked, and never to an empty file', () => {
    expect(toCsv([['é']])).toBe('é');
    expect(toCsv([['é']], { bom: true })).toBe(`${CSV_BOM}é`);
    expect(toCsv([], { bom: true })).toBe('');
  });
  it('falls back to a safe file name', () => {
    expect(csvFileName('!!!', 'reminders')).toBe('app-reminders.csv');
    expect(csvFileName('My App', '../x y')).toBe('myapp-xy.csv');
  });
});

describe('createActionGuard', () => {
  it('runs one action at a time: a second tap is skipped', async () => {
    const guard = createActionGuard(1000);
    let release!: () => void;
    const first = guard.run(() => new Promise<void>((r) => { release = r; }));
    expect(guard.running).toBe(true);
    expect(await guard.run(async () => {})).toEqual({ status: 'skipped' });
    release();
    expect(await first).toEqual({ status: 'ok' });
    expect(guard.running).toBe(false);
  });
  it('is free again after a failure, and reports it', async () => {
    const guard = createActionGuard(1000);
    const boom = new Error('boom');
    expect(await guard.run(() => Promise.reject(boom))).toEqual({ status: 'failed', error: boom });
    expect(await guard.run(async () => {})).toEqual({ status: 'ok' });
  });
  it('reports a throw from a plain function too', async () => {
    const guard = createActionGuard(1000);
    const out = await guard.run(() => { throw new Error('sync'); });
    expect(out.status).toBe('failed');
  });
  it('gives up on an action that never finishes, so the screen cannot stay stuck', async () => {
    vi.useFakeTimers();
    const guard = createActionGuard(500);
    const pending = guard.run(() => new Promise<void>(() => {}));
    await vi.advanceTimersByTimeAsync(501);
    expect(await pending).toMatchObject({ status: 'failed', error: { code: 'timeout' } });
    expect(guard.running).toBe(false);
    vi.useRealTimers();
  });
  it('does not raise an unhandled error when a timed-out action fails later', async () => {
    vi.useFakeTimers();
    const guard = createActionGuard(100);
    let fail!: (e: unknown) => void;
    const pending = guard.run(() => new Promise<void>((_, rej) => { fail = rej; }));
    await vi.advanceTimersByTimeAsync(101);
    await pending;
    fail(new Error('late'));
    await vi.advanceTimersByTimeAsync(10);
    vi.useRealTimers();
  });
});

describe('createSaveTracker', () => {
  it('saves a new value once, even if submit and blur both ask', () => {
    const t = createSaveTracker('old');
    expect(t.begin('new')).toBe(true);
    expect(t.begin('new')).toBe(false);
    t.finish('new', true);
    expect(t.saved).toBe('new');
    expect(t.begin('new')).toBe(false);
  });
  it('does not save an unchanged value', () => {
    expect(createSaveTracker('same').begin('same')).toBe(false);
  });
  it('after a failure the old value stays saved and the same value can be tried again', () => {
    const t = createSaveTracker('old');
    t.begin('new');
    t.finish('new', false);
    expect(t.saved).toBe('old');
    expect(t.begin('new')).toBe(true);
  });
  it('follows a new saved value from the parent', () => {
    const t = createSaveTracker('a');
    t.reset('b');
    expect(t.begin('b')).toBe(false);
  });
});

describe('photo', () => {
  it('accepts none, small image data and https links', () => {
    expect(safePhoto('')).toBe(true);
    expect(safePhoto(undefined)).toBe(true);
    expect(safePhoto('data:image/jpeg;base64,AAAA')).toBe(true);
    expect(safePhoto('https://example.com/a.png')).toBe(true);
  });
  it('refuses other schemes, other types and oversized data', () => {
    expect(safePhoto('http://example.com/a.png')).toBe(false);
    expect(safePhoto('file:///private/a.jpg')).toBe(false);
    expect(safePhoto('data:text/html;base64,AAAA')).toBe(false);
    expect(safePhoto('data:image/svg+xml;base64,AAAA')).toBe(false);
    expect(safePhoto(`data:image/png;base64,${'A'.repeat(50)}`, 40)).toBe(false);
  });
  it('knows a refused-access error from any other thrown value', () => {
    expect(isPermissionError(new Error('permission'))).toBe(true);
    expect(isPermissionError(new Error('other'))).toBe(false);
    expect(isPermissionError('permission')).toBe(false);
    expect(isPermissionError(null)).toBe(false);
  });
});

describe('links and mail', () => {
  it('opens only https links', () => {
    expect(isHttps('https://x.y/p')).toBe(true);
    expect(isHttps('http://x.y/p')).toBe(false);
    expect(isHttps('javascript:alert(1)')).toBe(false);
    expect(isHttps(undefined)).toBe(false);
  });
  it('checks an address has no extra parts', () => {
    expect(isEmail('help@x.com')).toBe(true);
    expect(isEmail('a@b.com?bcc=x@evil.com')).toBe(false);
    expect(isEmail('a@b.com,c@d.com')).toBe(false);
  });
  it('can never add a recipient through the support address', () => {
    const url = supportMailUrl({ email: 'a@b.com?bcc=x@evil.com', appName: 'A', versionNumber: '1', device: 'ios' });
    expect(url.startsWith('mailto:a%40b.com%3Fbcc%3Dx%40evil.com?subject=')).toBe(true);
  });
});

describe('initial letter', () => {
  it('takes a whole emoji, not half of it', () => {
    expect(initialOf('😀 fun', null)).toBe('😀');
  });
});

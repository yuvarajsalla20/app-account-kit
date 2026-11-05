import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, withAction } from './helpers/render';

afterEach(() => vi.useRealTimers());

const never = () => new Promise<void>(() => {});

describe('useAction', () => {
  it('is busy while it runs, clears the old note, and says it worked', async () => {
    const h = withAction(() => null);
    act(() => h.held.action.setNote('old'));
    let release!: () => void;
    let result!: Promise<boolean>;
    act(() => {
      result = h.held.action.run('x', () => new Promise<void>((r) => (release = r)), () => 'failed');
    });
    expect(h.held.action.busy).toBe(true);
    expect(h.held.action.note).toBeNull();
    await act(async () => {});
    await act(async () => {
      release();
      await result;
    });
    expect(await result).toBe(true);
    expect(h.held.action.busy).toBe(false);
  });

  it('reports a failure through onError and shows the text the part chose', async () => {
    const onError = vi.fn();
    const boom = new Error('boom');
    const h = withAction(() => null, { onError });
    let ok = true;
    await act(async () => void (ok = await h.held.action.run('save', () => Promise.reject(boom), (e) => `Could not: ${(e as Error).message}`)));
    expect(ok).toBe(false);
    expect(onError).toHaveBeenCalledWith('save', boom);
    expect(h.held.action.note).toBe('Could not: boom');
    expect(h.held.action.noteGood).toBe(false);
  });

  it('starts an action once when it is tapped twice', async () => {
    const h = withAction(() => null);
    const action = vi.fn(never);
    act(() => void h.held.action.run('x', action, () => 'f'));
    let second = true;
    await act(async () => void (second = await h.held.action.run('x', action, () => 'f')));
    expect(second).toBe(false);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('says "taking too long" when the time limit passes, not "failed"', async () => {
    vi.useFakeTimers();
    const onError = vi.fn();
    const h = withAction(() => null, { timeoutMs: 1000, tookTooLong: 'Slow.', onError });
    act(() => void h.held.action.run('save', never, () => 'Could not save.'));
    await act(async () => void (await vi.advanceTimersByTimeAsync(1001)));
    expect(h.held.action.note).toBe('Slow.');
    expect(h.held.action.busy).toBe(false);
    expect(onError).toHaveBeenCalledWith('save', expect.objectContaining({ code: 'timeout' }));
  });

  it('never cuts off an action that waits for the person (patient)', async () => {
    vi.useFakeTimers();
    const h = withAction(() => null, { timeoutMs: 1000, tookTooLong: 'Slow.' });
    let release!: () => void;
    let done!: Promise<boolean>;
    act(() => {
      done = h.held.action.run('share', () => new Promise<void>((r) => (release = r)), () => 'failed', { patient: true });
    });
    await act(async () => void (await vi.advanceTimersByTimeAsync(120_000)));
    expect(h.held.action.busy).toBe(true);
    expect(h.held.action.note).toBeNull();
    await act(async () => {
      release();
      await done;
    });
    expect(await done).toBe(true);
    expect(h.held.action.note).toBeNull();
  });

  it('counts every note, so the same words shown again can be announced again', () => {
    const h = withAction(() => null);
    act(() => h.held.action.setNote('Same.'));
    const first = h.held.action.noteKey;
    act(() => h.held.action.setNote('Same.'));
    expect(h.held.action.noteKey).toBe(first + 1);
    act(() => h.held.action.setNote(null));
    expect(h.held.action.noteKey).toBe(first + 1);
  });

  it('uses the app\'s own words for an error it knows, else the fallback', () => {
    const h = withAction(() => null, { describeError: (e) => ((e as { code?: string }).code === 'auth/x' ? 'Plain words.' : null) });
    expect(h.held.action.describe({ code: 'auth/x' }, 'fallback')).toBe('Plain words.');
    expect(h.held.action.describe(new Error('?'), 'fallback')).toBe('fallback');
  });
});

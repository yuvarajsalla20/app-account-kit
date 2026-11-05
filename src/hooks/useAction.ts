import { useCallback, useState } from 'react';
import { createActionGuard } from '../logic/actionGuard';

export interface ActionRunner {
  busy: boolean;
  /** A short message under the screen's title area: a success or a failure. */
  note: string | null;
  /** True when the note reports a success (shown in the accent color); failures use the danger color. */
  noteGood: boolean;
  /** Counts up every time a note is set, so the same words shown again can still be announced. */
  noteKey: number;
  setNote: (text: string | null, good?: boolean) => void;
  /** Plain words for an error: the app's own `describeError` when it knows the error, else `fallback`. */
  describe: (error: unknown, fallback: string) => string;
  /**
   * Runs one action with `busy` on and the old note cleared. A failure is reported through `onError`
   * and shown as `failure(error)`; an action that takes longer than the timeout is reported as "taking too long"
   * (it may still finish). Pass `{ patient: true }` for an action that waits for the person, such as a share sheet or a photo picker:
   * it is never cut off. Returns true when it worked.
   */
  run: (where: string, action: () => Promise<void> | void, failure: (error: unknown) => string, options?: { patient?: boolean }) => Promise<boolean>;
}

/** One place for "busy, then done or failed": every section uses it instead of its own try/catch. */
export function useAction(onError?: (where: string, error: unknown) => void, describeError?: (error: unknown) => string | null | undefined, timeoutMs?: number, tookTooLong?: string): ActionRunner {
  const [busy, setBusy] = useState(false);
  const [note, setNoteText] = useState<string | null>(null);
  const [noteGood, setNoteGood] = useState(false);
  const [noteKey, setNoteKey] = useState(0);
  // `busy` only turns true after a re-render, so a quick double tap would start the action twice. The guard flips at once.
  const [guard] = useState(() => createActionGuard(timeoutMs));
  const setNote = useCallback((text: string | null, good = false) => {
    setNoteText(text);
    setNoteGood(!!text && good);
    if (text) setNoteKey((k) => k + 1);
  }, []);
  const run = useCallback<ActionRunner['run']>(
    async (where, action, failure, options) => {
      if (guard.running) return false;
      setBusy(true);
      setNote(null);
      const outcome = await guard.run(action, options);
      setBusy(false);
      if (outcome.status === 'failed') {
        onError?.(where, outcome.error);
        const slow = tookTooLong && (outcome.error as { code?: string } | null)?.code === 'timeout';
        setNote(slow ? tookTooLong : failure(outcome.error));
      }
      return outcome.status === 'ok';
    },
    [guard, onError, setNote, tookTooLong],
  );
  const describe = useCallback((error: unknown, fallback: string) => describeError?.(error) || fallback, [describeError]);
  return { busy, note, noteGood, noteKey, setNote, describe, run };
}

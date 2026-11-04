import { useCallback, useState } from 'react';

export interface ActionRunner {
  busy: boolean;
  /** A short message under the screen's title area: a success or a failure. */
  note: string | null;
  setNote: (text: string | null) => void;
  /**
   * Runs one action with `busy` on and the old note cleared. A failure is reported through `onError`
   * and shown as `failure(error)`. Returns true when it worked.
   */
  /** Plain words for an error: the app's own `describeError` when it knows the error, else `fallback`. */
  describe: (error: unknown, fallback: string) => string;
  run: (where: string, action: () => Promise<void> | void, failure: (error: unknown) => string) => Promise<boolean>;
}

/** One place for "busy, then done or failed": every section uses it instead of its own try/catch. */
export function useAction(onError?: (where: string, error: unknown) => void, describeError?: (error: unknown) => string | null | undefined): ActionRunner {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const run = useCallback<ActionRunner['run']>(
    async (where, action, failure) => {
      setBusy(true);
      setNote(null);
      try {
        await action();
        return true;
      } catch (e) {
        onError?.(where, e);
        setNote(failure(e));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [onError],
  );
  const describe = useCallback((error: unknown, fallback: string) => describeError?.(error) || fallback, [describeError]);
  return { busy, note, setNote, describe, run };
}

/** The result of asking the guard to run something. */
export type Outcome = { status: 'skipped' } | { status: 'ok' } | { status: 'failed'; error: unknown };

/** How long an action may take before the screen stops waiting (ms). Longer than the sign-in kit's own 30 s delete limit. */
export const DEFAULT_ACTION_TIMEOUT_MS = 45_000;

/**
 * Lets one action run at a time and never waits forever. A second call while one runs is skipped. If the action
 * does not finish in time the guard reports a failure with `code: 'timeout'` and is free again, so the screen cannot stay stuck.
 */
export const createActionGuard = (timeoutMs: number = DEFAULT_ACTION_TIMEOUT_MS) => {
  let running = false;
  return {
    get running(): boolean {
      return running;
    },
    async run(action: () => Promise<void> | void): Promise<Outcome> {
      if (running) return { status: 'skipped' };
      running = true;
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const work = Promise.resolve().then(action);
        work.catch(() => {}); // a late failure after we stopped waiting is not an unhandled error
        const limit = new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'timeout' })), timeoutMs);
        });
        await Promise.race([work, limit]);
        return { status: 'ok' };
      } catch (error) {
        return { status: 'failed', error };
      } finally {
        clearTimeout(timer);
        running = false;
      }
    },
  };
};

/**
 * Remembers what was last saved and what is saving now, so a box that saves on submit AND on blur (or on leaving the page)
 * sends each change once. `begin` says whether to save; `finish` records the result.
 */
export const createSaveTracker = (initial: string) => {
  let saved = initial;
  let inFlight: string | null = null;
  return {
    get saved(): string {
      return saved;
    },
    /** True when `value` is new and nothing is already saving it. */
    begin(value: string): boolean {
      if (value === saved || value === inFlight) return false;
      inFlight = value;
      return true;
    },
    finish(value: string, ok: boolean): void {
      if (inFlight === value) inFlight = null;
      if (ok) saved = value;
    },
    /** The parent handed in a new saved value (for example after sign-in). */
    reset(value: string): void {
      saved = value;
    },
  };
};

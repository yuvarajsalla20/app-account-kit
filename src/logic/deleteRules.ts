/** Whether the "Delete everything" button may be pressed: not while busy, and with a password when the login needs one. */
export const canConfirmDelete = (state: { busy: boolean; confirmsWithPassword: boolean; password: string }): boolean =>
  !state.busy && (!state.confirmsWithPassword || state.password.length > 0);

/** Whether the typed word matches the one asked for ("DELETE"), ignoring case and spaces around it (7.17.0). */
export const typedWordMatches = (typed: string, word: string): boolean => typed.trim().toUpperCase() === word.trim().toUpperCase() && word.trim().length > 0;

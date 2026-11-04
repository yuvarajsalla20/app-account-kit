/** Whether the "Delete everything" button may be pressed: not while busy, and with a password when the login needs one. */
export const canConfirmDelete = (state: { busy: boolean; confirmsWithPassword: boolean; password: string }): boolean =>
  !state.busy && (!state.confirmsWithPassword || state.password.length > 0);

/** A nickname as saved: trimmed and cut to `max` characters. */
export const cleanNickname = (text: string, max: number): string => text.trim().slice(0, max);

/** The first letter shown when there is no photo: from the nickname, else the email, else `fallback`. */
export const initialOf = (name: string, email: string | null, fallback = '?'): string =>
  (name.trim() || email?.trim() || fallback).slice(0, 1).toUpperCase();

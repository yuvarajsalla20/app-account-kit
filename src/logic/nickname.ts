/** A nickname as saved: trimmed and cut to `max` characters. */
export const cleanNickname = (text: string, max: number): string => Array.from(text.trim()).slice(0, max).join('');

/** The first letter shown when there is no photo: from the nickname, else the email, else `fallback`. */
export const initialOf = (name: string, email: string | null, fallback = '?'): string =>
  Array.from(name.trim() || email?.trim() || fallback)[0].toUpperCase();

/** A nickname as saved: trimmed and cut to `max` characters. */
export const cleanNickname = (text: string, max: number): string => Array.from(text.trim()).slice(0, max).join('');

/** The first character as a person sees it: a whole emoji (a flag, a family) where the platform can tell, else one code point. */
const firstCharacter = (text: string): string => {
  const Segmenter = (Intl as { Segmenter?: new (locale?: string, options?: { granularity: 'grapheme' }) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter;
  if (Segmenter) for (const part of new Segmenter(undefined, { granularity: 'grapheme' }).segment(text)) return part.segment;
  return Array.from(text)[0] ?? '';
};

/**
 * The first letter shown when there is no photo: from the nickname, else the email, else `fallback`. Settings uses
 * `initialOf(profile.name, profile.email)`; call it the same way for an avatar outside Settings (Home), so both show the same letter.
 */
export const initialOf = (name: string, email: string | null, fallback = '?'): string =>
  firstCharacter(name.trim() || email?.trim() || fallback).toUpperCase();

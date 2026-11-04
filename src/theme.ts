/** The rows the kit draws itself, each with its own icon color. */
export const TINT_KEYS = ['account', 'app', 'about', 'password', 'data', 'share', 'rate', 'privacy', 'support', 'version'] as const;
export type TintKey = (typeof TINT_KEYS)[number];

/**
 * Every color and size the Settings screen uses. The kit has no look of its own: the app passes all of it, once,
 * so a missing value is a type error at build time and never a silently wrong color.
 */
export interface AccountTheme {
  /** Main text and icons. */
  text: string;
  muted: string;
  faint: string;
  /** The highlight: primary buttons. */
  accent: string;
  /** Text and icons that sit on the accent. */
  ink: string;
  /** Fill of a card, and its edge. */
  surface: string;
  border: string;
  /** The thin line between rows inside a card. */
  line: string;
  /** Fill of text boxes and quiet buttons. */
  field: string;
  /** Fill of the delete-confirmation panel. */
  panel: string;
  danger: string;
  /** The "on" color of switches. */
  on: string;
  /** Rounded corners of a card. */
  radius: number;
  /** Icon color of each row the kit draws. */
  tints: Record<TintKey, string>;
}

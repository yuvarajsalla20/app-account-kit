/** Colors the Account screen uses. Pass only what differs from the defaults. */
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
}

export const DEFAULT_THEME: AccountTheme = {
  text: '#F5F5F7',
  muted: '#9A9AA0',
  faint: '#76767C',
  accent: '#5B8CFF',
  ink: '#0B0B0C',
  surface: '#141416',
  border: '#232326',
  line: '#232326',
  field: '#1C1C1F',
  panel: '#1C1416',
  danger: '#FF8A80',
  on: '#34C759',
  radius: 22,
};

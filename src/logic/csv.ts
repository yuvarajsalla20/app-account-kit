// A plain number such as -12.50 or +3 is safe: it cannot run as a formula.
const PLAIN_NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)$/;

const cell = (value: string): string => {
  // A leading = + - or @ would run as a formula in Excel and Sheets, so mark it as plain text (plain numbers stay numbers).
  const text = /^[=+\-@\t\r]/.test(value) && !PLAIN_NUMBER.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Put this first in a file for Excel to read accents and non-English letters correctly. */
export const CSV_BOM = '\uFEFF';

/** Rows of text as CSV that opens safely in Excel, Numbers and Google Sheets. The first row is usually the header. `bom` adds the Excel marker. */
export const toCsv = (rows: readonly (readonly string[])[], options: { bom?: boolean } = {}): string =>
  (options.bom && rows.length ? CSV_BOM : '') + rows.map((row) => row.map(cell).join(',')).join('\n');

const slug = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]+/g, '');

/** File-safe names like myapp-reminders.csv. A name with no letters or digits falls back to "app". */
export const csvFileName = (appName: string, stem: string): string => `${slug(appName) || 'app'}-${slug(stem) || 'data'}.csv`;

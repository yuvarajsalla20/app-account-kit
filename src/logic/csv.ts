const cell = (value: string): string => {
  // A leading = + - or @ would run as a formula in Excel and Sheets, so mark it as plain text.
  const text = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Rows of text as CSV that opens safely in Excel, Numbers and Google Sheets. The first row is usually the header. */
export const toCsv = (rows: readonly (readonly string[])[]): string => rows.map((row) => row.map(cell).join(',')).join('\n');

/** File-safe names like myapp-reminders.csv. */
export const csvFileName = (appName: string, stem: string): string => `${appName.toLowerCase().replace(/[^a-z0-9]+/g, '')}-${stem}.csv`;

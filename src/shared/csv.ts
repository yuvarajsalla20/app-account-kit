// 10.1.0: the CSV helpers are app-core-kit's single copy (they also guard a cell that starts with a tab or return).
/** @deprecated Use `CSV_BOM` and `toCsv` (or `exportCsv`) from app-export-kit. */
export { CSV_BOM, toCsv } from 'app-core-kit/shared';

const slug = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]+/g, '');

/** @deprecated Use `exportFileName` from app-export-kit; this copy goes in 8.0.0. File-safe names like myapp-reminders.csv. A name with no letters or digits falls back to "app". */
export const csvFileName = (appName: string, stem: string): string => `${slug(appName) || 'app'}-${slug(stem) || 'data'}.csv`;

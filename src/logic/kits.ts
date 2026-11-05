const SEPARATOR = ' | ';

/** "core 1.4.0 | auth 1.6.0", the line shown in support emails. */
export const kitsLine = (kits: Record<string, string>): string =>
  Object.entries(kits)
    .map(([name, version]) => `${name} ${version}`)
    .join(SEPARATOR);

/** The same line as one entry per kit, for the Kits list. */
export const kitLines = (line: string): string[] => line.split(SEPARATOR).filter(Boolean);

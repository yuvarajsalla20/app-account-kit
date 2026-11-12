import type { KitInfo } from '../types';

const SEPARATOR = ' | ';

/** "core 1.4.0 | auth 1.6.0", the line shown in support emails. */
export const kitsLine = (kits: Record<string, string>): string =>
  Object.entries(kits)
    .map(([name, version]) => `${name} ${version}`)
    .join(SEPARATOR);

/** The same line as one entry per kit, for the Kits list. */
export const kitLines = (line: string): string[] => line.split(SEPARATOR).filter(Boolean);

/** One line per kit for the Kits list, like "Account Kit | v7.5.0 | Build 1a2b3c4". Takes the list or the older one-line text. */
export const kitListLines = (kits: string | readonly KitInfo[], buildWord = 'Build'): string[] =>
  typeof kits === 'string'
    ? kitLines(kits)
    : kits.map((k) => [k.name, `v${k.version}`, k.build ? `${buildWord} ${k.build}` : ''].filter(Boolean).join(SEPARATOR));

/** The kits as one line for support emails, like "Account Kit 7.5.0 (1a2b3c4) | Auth Kit 1.10.0". */
export const kitsMailLine = (kits: string | readonly KitInfo[]): string =>
  typeof kits === 'string' ? kits : kits.map((k) => `${k.name} ${k.version}${k.build ? ` (${k.build})` : ''}`).join(SEPARATOR);

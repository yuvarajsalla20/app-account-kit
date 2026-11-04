/** One line listing every kit an app uses, like "core 1.4.0 · auth 2.1.0 · account 3.1.0". Each kit exports its own KIT_VERSION. */
export const kitsLine = (kits: Record<string, string>): string =>
  Object.entries(kits)
    .map(([name, version]) => `${name} ${version}`)
    .join(' · ');

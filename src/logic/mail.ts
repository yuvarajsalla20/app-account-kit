interface SupportMail {
  email: string;
  appName: string;
  /** The version number, like 0.2.0. */
  versionNumber: string;
  /** Like "ios 18.1". */
  device: string;
  /** The kit versions in use, like "core 1.4.0 · account 3.1.0". */
  kits?: string;
}

import { isEmail } from './links';

/** A mailto: address with the app, version and device filled in, so support can see what the person is using. */
export const supportMailUrl = ({ email, appName, versionNumber, device, kits }: SupportMail): string => {
  const subject = encodeURIComponent(`${appName} ${versionNumber} support`);
  const body = encodeURIComponent(`\n\n\n—\n${appName} ${versionNumber} · ${device}${kits ? `\nKits: ${kits}` : ''}`);
  const to = isEmail(email) ? email.trim() : encodeURIComponent(email); // a stray ? or & can never add a recipient
  return `mailto:${to}?subject=${subject}&body=${body}`;
};

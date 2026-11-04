interface SupportMail {
  email: string;
  appName: string;
  /** The version number, like 0.2.0. */
  versionNumber: string;
  /** Like "ios 18.1". */
  device: string;
}

/** A mailto: address with the app, version and device filled in, so support can see what the person is using. */
export const supportMailUrl = ({ email, appName, versionNumber, device }: SupportMail): string => {
  const subject = encodeURIComponent(`${appName} ${versionNumber} support`);
  const body = encodeURIComponent(`\n\n\n—\n${appName} ${versionNumber} · ${device}`);
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

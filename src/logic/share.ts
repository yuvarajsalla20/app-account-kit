import { isHttps } from './links';

/** The text handed to the share sheet. An app can pass its own `message`; otherwise the wording template is used. */
export const buildShareMessage = (template: (appName: string, url: string) => string, appName: string, url: string, message?: string): string =>
  message ? `${message.trim()} ${url}`.trim() : template(appName, url);

/** Share can only share once the app has a link (an https App Store address); before that the row says it is not available yet. */
export const canShare = isHttps;

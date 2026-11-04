/** The text handed to the share sheet. An app can pass its own `message`; otherwise the wording template is used. */
export const buildShareMessage = (template: (appName: string, url: string) => string, appName: string, url: string, message?: string): string =>
  message ? `${message.trim()} ${url}`.trim() : template(appName, url);

/** The Share row only appears once the app has a link to share (an App Store address). */
export const canShare = (url?: string): url is string => !!url && /^https?:\/\//i.test(url.trim());

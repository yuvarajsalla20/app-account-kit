/** A web address that is safe to open from a settings row: https only. */
export const isHttps = (url?: string): url is string => !!url && /^https:\/\/\S+$/i.test(url.trim());

/** A plain address like name@host.com, with no extra parts that could add a recipient. */
export const isEmail = (text: string): boolean => /^[^\s@?&,;<>]+@[^\s@?&,;<>]+$/.test(text.trim());

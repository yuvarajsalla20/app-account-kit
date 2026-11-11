import type Feather from '@expo/vector-icons/Feather';
import type { ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

export type IconName = keyof typeof Feather.glyphMap;
export type PhotoSource = 'camera' | 'library';

/** Who is signed in, as shown at the top. */
export interface ProfileInfo {
  /** The nickname, or empty. */
  name: string;
  /** Shown when there is no nickname, for example the app's name. */
  fallbackName: string;
  email: string | null;
  /** A small picture as a data URI or address, or empty. */
  photo: string;
  /** A picture from the sign-in provider, used when `photo` is empty. */
  fallbackPhoto?: string;
}

export interface NicknameProps {
  max: number;
  /** Saves the cleaned nickname. */
  onSave: (name: string) => Promise<void> | void;
}

export interface PhotoProps {
  /** Picks or takes a photo and returns it as a small picture, or null when cancelled. Throw an Error saying "permission" if access was refused. */
  pick: (source: PhotoSource) => Promise<string | null>;
  /** Saves the picked photo (an empty string removes it). */
  onChange: (photo: string) => Promise<void> | void;
  /** The most characters a picked photo may have (default about 300 KB as a data address). Anything bigger, or not a jpeg/png/webp data address or https link, is refused. */
  maxChars?: number;
  cameraSupported: boolean;
}

/** Present only for people who sign in with a password. */
export interface PasswordProps {
  /** Sets the new password. The current one is passed too, so the app can sign the person in again first (Firebase asks for a recent sign-in). Throw to show an error. */
  onChange: (currentPassword: string, newPassword: string) => Promise<void>;
  /** The shortest new password allowed. Default 8, the same as app-auth-kit. */
  minLength?: number;
}

/** One way to download the data, such as CSV. */
export interface DataFormat {
  id: string;
  /** What the person sees, such as "CSV". */
  label: string;
  /** Makes and shares the file. Throw to show "Could not create the file". */
  onDownload: () => Promise<void>;
}

export interface DataProps {
  /** The row's label, such as "Download my reminders". */
  label: string;
  /** With one format the row shows its name and a tap downloads it. With two or more a tap opens a sheet from the bottom to choose. */
  formats: readonly [DataFormat, ...DataFormat[]];
}

export interface AboutProps {
  appName: string;
  /** The app's picture, shown above its name. Pass `require('./assets/icon.png')` or `{ uri }`. Leave out for no picture. */
  logo?: ImageSourcePropType;
  /** The number, like 0.2.0 (added to support emails), and the line shown small under the name, like "v0.2 · Nov 3, 2026 · 10:25 PM CT". */
  version: { number: string; label: string };
  privacyUrl: string;
  supportEmail: string;
  /** The Share row appears when this is passed. It shares once `url` is a secure App Store address; until then a tap says it is not available yet. `message` replaces the default wording. */
  share?: { url?: string; message?: string };
  /** All the kit versions in use (build it with `kitsLine`). Shown as a Kits row in About that opens a list, and added to support emails. */
  kits?: string;
  /** The Rate row (iPhone only) appears when this is passed. It opens the App Store's own review screen once `appStoreId` is set; until then a tap says it is not available yet. */
  rate?: { appStoreId?: string };
}

export interface ActionsProps {
  /** Leave out when there is no sign-in. */
  onSignOut?: () => Promise<void> | void;
  /**
   * Erases the person's data and login. Leave out when there is no sign-in.
   * The kit cannot see who is asking: this callback MUST confirm the person's identity again (password, Apple or Google)
   * before it erases anything, as app-auth-kit's `deleteAccount` does.
   */
  onDeleteAccount?: (password: string) => Promise<void>;
  /** True when deleting needs the password typed (false when Apple or Google confirms inside `onDeleteAccount`). */
  confirmsWithPassword: boolean;
}

/** The App page: the app's own settings. */
export interface AppPageProps {
  /** Build the rows with SettingsGroup and SettingRow. */
  content: ReactNode;
}

/** A page the app adds to the main list. */
export interface ExtraPage {
  /** Unique, and not one of the kit's names (`hub`, `account`, `data`, `app`, `about`, `password`). */
  id: string;
  /** The row's name and the page title. */
  label: string;
  icon: IconName;
  /** The color of the icon tile. Default: the App page's. */
  tint?: string;
  /** Build the rows with SettingsGroup and SettingRow. */
  content: ReactNode;
}

export interface SettingsScreenProps {
  /** Back from the main list (to Home). Back from every other page returns to the list. */
  onBack: () => void;
  backLabel?: string;
  /** The app's logo and name, drawn centred in the top row beside the Back button. Leave out for the older layout (a centred page title). Not shown on About, where the app's own picture is already the header. */
  brand?: ReactNode;
  profile: ProfileInfo;
  nickname: NicknameProps;
  /** Leave out to hide Change photo. */
  photo?: PhotoProps;
  /** Leave out to hide Change password (people who sign in with Apple or Google). */
  password?: PasswordProps;
  /** Leave out to hide the My data row. */
  data?: DataProps;
  about: AboutProps;
  actions: ActionsProps;
  /** Leave out when the app has no settings of its own: the App row is hidden. */
  app?: AppPageProps;
  /** Pages of the app's own, each a row on the main list with its own page (a Premium page, say). The kit knows nothing about what they hold. */
  extraPages?: readonly ExtraPage[];
  /** The order of the rows on the main list: `'account' | 'data' | 'app' | 'about'` and the `id` of each extra page. Default: account, data, app, extra pages, about. Pages you leave out follow in that order; pages the app does not have are not shown. Rename a row with `strings` (`myData`, `app`). */
  hubOrder?: readonly string[];
  /** Turns a sign-in error (wrong password, asked too often) into plain words. Return nothing for errors it does not know. */
  describeError?: (error: unknown) => string | null | undefined;
  /** How long a save, delete or other action may take before the screen stops waiting (ms). Default 45 s, a little over app-auth-kit's own 30 s delete limit. */
  actionTimeoutMs?: number;
  /** Quiet failures, for crash reporting. */
  onError?: (where: string, error: unknown) => void;
}

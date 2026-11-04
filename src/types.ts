import type { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';

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
  cameraSupported: boolean;
}

/** Present only for people who sign in with a password. */
export interface PasswordProps {
  /** Emails them a link to set a new password. */
  onSend: () => Promise<void>;
}

export interface DataProps {
  /** The row's label, such as "Download my reminders". */
  label: string;
  /** A short note on the right, such as "CSV". */
  value?: string;
  onDownload: () => Promise<void>;
}

export interface AboutProps {
  appName: string;
  /** The number, like 0.2.0, and the full line shown in the Version row, like "v0.2 · Nov 3, 2026 · 10:25 PM CT". */
  version: { number: string; label: string };
  privacyUrl: string;
  supportEmail: string;
  /** The Share row appears when `url` is set (the App Store address). `message` replaces the default wording. */
  share?: { url?: string; message?: string };
}

export interface ActionsProps {
  /** Leave out when there is no sign-in. */
  onSignOut?: () => void;
  /** Erases the person's data and login. Leave out when there is no sign-in. */
  onDeleteAccount?: (password: string) => Promise<void>;
  /** True when deleting needs the password typed (false when Apple or Google confirms). */
  confirmsWithPassword: boolean;
}

export interface AccountScreenProps {
  profile: ProfileInfo;
  nickname: NicknameProps;
  /** Leave out to hide Change photo. */
  photo?: PhotoProps;
  /** Leave out to hide Change password (people who sign in with Apple or Google). */
  password?: PasswordProps;
  /** Leave out to hide the data download. */
  data?: DataProps;
  about: AboutProps;
  actions: ActionsProps;
  /** The app's own settings, shown between Profile and About. Build them with SettingsGroup and SettingRow. */
  children?: ReactNode;
  /** Turns a sign-in error (wrong password, asked too often) into plain words. Return nothing for errors it does not know. */
  describeError?: (error: unknown) => string | null | undefined;
  /** Quiet failures, for crash reporting. */
  onError?: (where: string, error: unknown) => void;
}

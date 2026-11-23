import type { PullDownItem } from './ui/PullDown';
import type Feather from '@expo/vector-icons/Feather';
import type { ReactElement, ReactNode } from 'react';
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
  /**
   * Centred profile (opt-in): a bigger photo in the middle, with a small round pencil on its corner in place of the
   * "Change photo" link, and no name beside it (the nickname stays in its field below). Default: photo left, name and link beside it.
   */
  centered?: boolean;
}

export interface NicknameProps {
  max: number;
  /** Saves the cleaned nickname. */
  onSave: (name: string) => Promise<void> | void;
}

export interface PhotoProps {
  /** Picks or takes a photo and returns it as a small picture, or null when cancelled. Throw an Error saying "permission" if access was refused. 7.29.0: `pickProfilePhoto` from `app-account-kit/photo` does all this. */
  pick: (source: PhotoSource) => Promise<string | null>;
  /** Saves the picked photo (an empty string removes it). */
  onChange: (photo: string) => Promise<void> | void;
  /** The most characters a picked photo may have (default `DEFAULT_PHOTO_MAX_CHARS`, 80,000 since 7.29.0, the limit in both apps' Firestore rules). Anything bigger, or not a jpeg/png/webp data address or https link, is refused. */
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

/** One kit in the About Kits list. `build` is optional, such as the short commit the app pins. */
export interface KitInfo {
  name: string;
  version: string;
  build?: string;
}

export interface AboutProps {
  appName: string;
  /**
   * The app's picture, shown above its name. Pass `require('./assets/icon.png')` or `{ uri }` for the 84 pt rounded square,
   * or (7.21.0) a drawn element such as `<MyLogo />`, shown as it is at its own size (for a logo that is not square, or has a glow).
   * Leave out for no picture.
   */
  logo?: ImageSourcePropType | ReactElement;
  /**
   * Whether About opens with the app's name (and `logo`) at the top. Default true. Pass false when the app already shows its
   * own brand elsewhere on the page (for example a `footer`), so the name and logo are not shown twice.
   * 7.30.0: `'logo'` keeps the page title "About" in the header and shows only the logo under it (no name), larger.
   */
  showHeader?: boolean | 'logo';
  /**
   * The number, like 0.2.0 (added to support emails), and what the Version row shows when it is opened.
   * `lines` is one entry per line, like ["v0.2.0 | Build 12", "Nov 3, 2026 | 10:25 PM CT"]; without it the row shows `label`.
   */
  version: { number: string; label: string; lines?: readonly string[] };
  privacyUrl: string;
  /** The Features row appears when this is passed: a secure web page listing what the app does. */
  featuresUrl?: string;
  supportEmail: string;
  /**
   * The Share row appears only when `url` is a secure (https) address, such as the App Store page (7.29.0: an empty object, an
   * empty or http `url` shows no row). Pass the app's store constant always; the row comes when it is filled. `message` replaces the default wording.
   */
  share?: { url?: string; message?: string };
  /**
   * All the kits in use. Shown as a Kits row in About that opens one line per kit, and added to support emails.
   * Pass a list (`{ name: 'Account Kit', version: '7.5.0', build: '1a2b3c4' }`) for "Account Kit | v7.5.0 | Build 1a2b3c4" lines,
   * or the older one-line text built with `kitsLine`.
   */
  kits?: string | readonly KitInfo[];
  /**
   * The Rate row appears on iPhone only when `appStoreId` is the app's App Store number (digits, such as 6740123456), and opens
   * the App Store's own review screen (7.29.0: an empty object or a missing or malformed id shows no row). 7.27.0: on Android
   * it appears only when `playPackage` (the app's Google Play package name, such as com.example.app) is set, and opens the app's Play Store page.
   */
  rate?: { appStoreId?: string; playPackage?: string };
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
  /**
   * Unique, and not one of the kit's own page names (`RESERVED_PAGE_IDS`): `hub`, `account`, `data`, `app`, `about`, `password`,
   * `support`, `signOut`, `deleteAccount`, `access`. 7.29.0: a page with one of those ids is left out, reported through `onError`
   * (`'extraPages'`) and, in development, with a console warning.
   */
  id: string;
  /** The row's name and the page title. */
  label: string;
  icon: IconName;
  /** The color of the icon tile. Default: the App page's. */
  tint?: string;
  /** A short value on the right of the row ("Yearly"), read out with the label. */
  value?: string;
  /** Drawn in place of `value` on the right of the row, such as a small pill. Screen readers hear `value`. */
  badge?: ReactNode;
  /** 7.34.0: a Premium feature: the gold Premium tag after the row's name, for every account (see `SettingRow.premium`). */
  premium?: boolean;
  /**
   * 7.34.0: the account cannot use it yet: the gold padlock on the right instead of the value, badge or menu. A tap calls
   * `onLocked` (open the plans), or opens `lockedOpens`, or opens the page when there is neither.
   */
  locked?: boolean;
  onLocked?: () => void;
  /** 7.35.0: while `locked` and with no `onLocked`, a tap opens this Settings page instead, such as the plan page's id. */
  lockedOpens?: string;
  /**
   * 7.36.0: the row is an on/off switch, the same size as every other row, instead of opening a page (`content` is then not
   * shown; pass `null`). A tap anywhere on the row flips it. Used for a Premium setting in Preferences, such as Background
   * Effects. While `locked`, the padlock shows instead and a tap opens the plans as usual.
   */
  toggle?: { value: boolean; onChange: (value: boolean) => void };
  /** Build the rows with SettingsGroup and SettingRow. */
  content: ReactNode;
  /**
   * Where the row lives. Default: the main list, as a parent of its own (a Premium page).
   * `'account'`: a feature about the person's data (Data Export) shows on the Account page under Your data, and Back returns to Account.
   * `'app'` (since 7.10.0): a row on the App page (Preferences), in its own card under the app's settings, and Back returns to App.
   * With no `app` prop, the App row still shows when a page lives there, holding only those rows.
   * `'about'` (since 7.37.0): a help page (e.g., how to add a widget) as a row in About's Help card, after Contact Support, and Back returns to About.
   * A page with nothing to set belongs here, not in Preferences (the Page rule).
   */
  under?: 'account' | 'app' | 'about';
  /**
   * With `under: 'app'` (since 7.11.0): the heading of the card the row sits in, such as "On Your iPhone". Rows with the same
   * group share one titled card, in the order they first appear; rows with none share the untitled card, which comes first.
   */
  group?: string;
  /**
   * Opt-in (7.19.0): this page's header leaves out `brand` and puts the page title in the top row, on the left,
   * right beside Back (no logo row, no title line under it). Other pages keep the brand. Default false.
   */
  plainHeader?: boolean;
  /**
   * Opt-in (7.26.0): the row opens a pull-down menu in place instead of a page (`content` is then not shown). `pill` is the
   * grey value pill on the row; leave it out for a small up/down chevron. A tap on a line calls `onPick` with its id.
   */
  menu?: { pill?: string; head?: string; items: readonly PullDownItem[]; onPick: (id: string) => void };
}

/**
 * Opt-in (7.17.0): Sign out and Delete account leave the main list and sit behind a ⋯ button at the top right of Account.
 * Each opens its own page. Sign out asks once. Delete account takes the person through steps: the app's optional
 * `unlock` (Face ID or PIN, say), what they will lose (with "Sign out instead"), typing a word (DELETE), and a last
 * sign-in check before `actions.onDeleteAccount` runs.
 */
export interface ExitMenuProps {
  /**
   * Optional first step on the Delete account page: the app draws its own unlock (Face ID, PIN...) and calls `onUnlocked`
   * when it passes. Leave out and the page starts at "what you will lose".
   */
  unlock?: (onUnlocked: () => void) => ReactNode;
  /** The lines under "You will lose, forever:", such as "Every piece and its photos". Leave out to show only `strings.deleteWarning`. */
  losses?: readonly string[];
  /**
   * Opt-in (7.24.0): where the two actions sit. `'menu'` (the default) is the ⋯ at the top right of Account. `'page'` drops the ⋯
   * and puts one row at the bottom of Account (`strings.access`, "Access") that opens its own page with a Sign out row and a red
   * Delete account row. Each still opens the same Sign out and Delete account pages.
   */
  place?: 'menu' | 'page';
  /**
   * Opt-in (7.25.0), with `place: 'page'`: Sign out becomes its own row on Account, just above the group row, and the group
   * page holds only Delete account. The group row then shows a `user-x` icon; name it through `strings.access` (an app might
   * say "Deactivate"). Default false: both live on the group page.
   */
  signOutOnAccount?: boolean;
  /**
   * Opt-in (7.26.0), with `signOutOnAccount`: the Sign out row opens a small pull-down menu (`strings.signOutBody`, then a red
   * Sign out and Stay) instead of its own confirm page.
   */
  signOutMenu?: boolean;
  /**
   * Opt-in (7.26.0), with `signOutOnAccount`: the group page shows the Delete account steps itself (what you will lose, type
   * DELETE, last sign-in check) instead of a single Delete account row that opens them.
   */
  deleteOnAccess?: boolean;
}

export interface SettingsScreenProps {
  /** Back from the main list (to Home). Back from every other page returns to the list. */
  onBack: () => void;
  /**
   * 7.38.0: the page Settings opens on, such as `'app'` (Preferences) when a note elsewhere says "Change" the currency. Back then
   * returns to the list as usual. Default the list (`'hub'`). A page the app does not have opens the list.
   */
  startPage?: string;
  backLabel?: string;
  /** The app's logo and name, drawn centred in the top row beside the Back button. Leave out for the older layout (a centred page title). Not shown on About, where the app's own picture is already the header. */
  brand?: ReactNode;
  /**
   * Opt-in (7.20.0): every Settings page, the main list included, leaves out `brand` and puts its title in the top row,
   * on the left beside Back (the `plainHeader` look of 7.19.0, on every page). About keeps its own picture as the header. Default false.
   */
  plainHeaders?: boolean;
  /** Optional: something the app draws at the very end of the main list, under Sign out and Delete account, such as its logo and tagline. Shown on the main list only. Leave out and nothing changes. */
  footer?: ReactNode;
  /** Opt-in (7.15.0): also draw `footer` at the end of every other Settings page (About, Account, Preferences, extra pages...). Default false: main list only. */
  footerOnEveryPage?: boolean;
  /**
   * Optional (7.17.0): something the app draws at the very top of the main list, under the header, such as its logo and tagline.
   * Pass a function to draw something different per page (smaller on inner pages, say). Leave out and nothing changes.
   */
  top?: ReactNode | ((page: string) => ReactNode);
  /** Opt-in (7.17.0): also draw `top` at the top of every other Settings page. Default false: main list only. */
  topOnEveryPage?: boolean;
  /** Opt-in (7.17.0): move Sign out and Delete account behind a ⋯ menu on Account, each on its own page. Default: both stay on the main list. */
  exitMenu?: ExitMenuProps;
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
  /** Pages of the app's own, each a row with its own page: a parent on the main list (a Premium page, say), with `under: 'account'` a row on Account (Data Export), or with `under: 'app'` a row on the App page (Preferences). The kit knows nothing about what they hold. */
  extraPages?: readonly ExtraPage[];
  /** The order of the rows on the main list: `'account' | 'data' | 'app' | 'about'` and the `id` of each extra page. Default: account, data, app, extra pages, about. Pages you leave out follow in that order; pages the app does not have are not shown. Rename a row with `strings` (`myData`, `app`). Pages with `under` are not on the main list. */
  hubOrder?: readonly string[];
  /** Turns a sign-in error (wrong password, asked too often) into plain words. Return nothing for errors it does not know. */
  describeError?: (error: unknown) => string | null | undefined;
  /** How long a save, delete or other action may take before the screen stops waiting (ms). Default 45 s, a little over app-auth-kit's own 30 s delete limit. */
  actionTimeoutMs?: number;
  /** Quiet failures, for crash reporting. */
  onError?: (where: string, error: unknown) => void;
}

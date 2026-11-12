import type { PasswordProblem } from './logic/password';

/** Every word on the screen, so an app can translate or reword it. */
export interface AccountStrings {
  settings: string;
  account: string;
  myData: string;
  app: string;
  nickname: string;
  nicknamePlaceholder: string;
  changePhoto: string;
  profilePicture: string;
  takePhoto: string;
  library: string;
  removePhoto: string;
  photoPermission: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  savePassword: string;
  passwordChanged: string;
  passwordProblem: (problem: PasswordProblem, min: number) => string;
  back: string;
  about: string;
  share: string;
  shareMessage: (appName: string, url: string) => string;
  rate: string;
  privacy: string;
  contactSupport: string;
  noMail: (email: string) => string;
  kits: string;
  /** The About row that opens the app's features web page. */
  features: string;
  /** The About row that opens to show the version and build. */
  version: string;
  /** The word before a kit's build in the Kits list, as in "Account Kit | v7.5.0 | Build 1a2b3c4". */
  build: string;
  email: string;
  /** Under the support address when Contact support is open. */
  supportHint: string;
  /** Shown when Share or Rate is tapped before the app has an App Store link or number. */
  notOnStoreYet: string;
  /** The dimmed area behind a picker sheet, which closes it. */
  close: string;
  signOut: string;
  deleteAccount: string;
  deleteTitle: string;
  deleteWarning: string;
  deletePassword: string;
  deleteEverything: string;
  keepAccount: string;
  /** "Could not save the nickname. Try again." */
  couldNot: (action: string) => string;
  /** Shown when an action ran past the time limit: it may still finish, so do not just try again. */
  tookTooLong: string;
  saveNickname: string;
  nicknameSaved: string;
  signOutAction: string;
  openLink: string;
  photoInvalid: string;
  savePhoto: string;
  download: string;
  shareApp: string;
  openStore: string;
}

export const DEFAULT_STRINGS: AccountStrings = {
  settings: 'Settings',
  account: 'Account',
  myData: 'My data',
  app: 'App',
  nickname: 'Nickname',
  nicknamePlaceholder: 'Add a nickname',
  changePhoto: 'Change photo',
  profilePicture: 'Profile picture',
  takePhoto: 'Take photo',
  library: 'Library',
  removePhoto: 'Remove',
  photoPermission: 'Allow access in your phone settings to use this.',
  changePassword: 'Change password',
  currentPassword: 'Current password',
  newPassword: 'New password',
  confirmPassword: 'Confirm password',
  savePassword: 'Save',
  passwordChanged: 'Your password was changed.',
  passwordProblem: (problem, min) =>
    ({
      current: 'Enter your current password.',
      short: `The new password needs at least ${min} characters.`,
      same: 'The new password must be different from the current one.',
      mismatch: 'The two new passwords do not match.',
    })[problem],
  back: 'Back',
  about: 'About',
  share: 'Share',
  shareMessage: (appName, url) => `Try ${appName}: ${url}`,
  rate: 'Rate',
  privacy: 'Privacy policy',
  contactSupport: 'Contact support',
  noMail: (email) => `No mail app is set up. Write to ${email}`,
  kits: 'Kits',
  features: 'Features',
  version: 'Version',
  build: 'Build',
  email: 'Email',
  supportHint: 'Tap to write an email',
  notOnStoreYet: 'Available once the app is on the App Store.',
  close: 'Close',
  signOut: 'Sign out',
  deleteAccount: 'Delete account',
  deleteTitle: 'Delete your account?',
  deleteWarning: 'This erases every setting and piece of data, and your login. It cannot be undone. Download your data first if you want a copy.',
  deletePassword: 'Enter your password to confirm',
  deleteEverything: 'Delete everything',
  keepAccount: 'Keep my account',
  couldNot: (action) => `Could not ${action}. Try again.`,
  tookTooLong: 'This is taking too long. It may still finish, so check before you try again.',
  saveNickname: 'save the nickname',
  nicknameSaved: 'Nickname saved.',
  signOutAction: 'sign out',
  openLink: 'open the link',
  photoInvalid: 'That photo cannot be used. Try another one.',
  savePhoto: 'save the photo',
  download: 'create the file',
  shareApp: 'share the app',
  openStore: 'open the App Store',
};

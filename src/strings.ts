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
  share: (appName: string) => string;
  shareMessage: (appName: string, url: string) => string;
  rate: (appName: string) => string;
  privacy: string;
  contactSupport: string;
  noMail: (email: string) => string;
  version: string;
  kits: string;
  signOut: string;
  deleteAccount: string;
  deleteTitle: string;
  deleteWarning: string;
  deletePassword: string;
  deleteEverything: string;
  keepAccount: string;
  /** "Could not save the nickname. Try again." */
  couldNot: (action: string) => string;
  saveNickname: string;
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
  share: (appName) => `Share ${appName}`,
  shareMessage: (appName, url) => `Try ${appName}: ${url}`,
  rate: (appName) => `Rate ${appName}`,
  privacy: 'Privacy policy',
  contactSupport: 'Contact support',
  noMail: (email) => `No mail app is set up. Write to ${email}`,
  version: 'Version',
  kits: 'Kits',
  signOut: 'Sign out',
  deleteAccount: 'Delete account',
  deleteTitle: 'Delete your account?',
  deleteWarning: 'This erases every setting and piece of data, and your login. It cannot be undone. Download your data first if you want a copy.',
  deletePassword: 'Enter your password to confirm',
  deleteEverything: 'Delete everything',
  keepAccount: 'Keep my account',
  couldNot: (action) => `Could not ${action}. Try again.`,
  saveNickname: 'save the nickname',
  savePhoto: 'save the photo',
  download: 'create the file',
  shareApp: 'share the app',
  openStore: 'open the App Store',
};

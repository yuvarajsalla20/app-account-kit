import type { PasswordProblem } from './logic/password';

/** Every word on the screen, so an app can translate or reword it. */
export interface AccountStrings {
  settings: string;
  account: string;
  myData: string;
  /** No longer shown: the app's `under: 'account'` pages (such as Data Export) sit on Account with no heading. Kept so older apps still compile. */
  yourData: string;
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
  /** No longer shown: Contact Support is now a page of its own (`supportTitle`, `supportBody`, `writeToUs`, `supportNote`). Kept so older apps still compile. */
  supportHint: string;
  /** The heading of the Contact Support page. */
  supportTitle: string;
  /** The line under it. */
  supportBody: string;
  /** The button that writes the email. */
  writeToUs: string;
  /** Under the button: what the email already holds. */
  supportNote: string;
  /** Shown when Share or Rate is tapped before the app has an App Store link or number. */
  notOnStoreYet: string;
  /** The dimmed area behind a picker sheet, which closes it. */
  close: string;
  /** The ✕ and ✓ of a picker sheet that asks before keeping a choice. */
  cancel: string;
  done: string;
  /** What VoiceOver adds to an option that needs the paid plan, such as "Go Premium". */
  lockedHint: string;
  /** Shown under a picker when a locked option is tapped and the app gave no `onLocked`. */
  lockedNote: (choice: string) => string;
  signOut: string;
  deleteAccount: string;
  deleteTitle: string;
  deleteWarning: string;
  deletePassword: string;
  deleteEverything: string;
  keepAccount: string;
  /** 7.17.0, `exitMenu` only. What VoiceOver says for the ⋯ button on Account. */
  moreOptions: string;
  /** 7.24.0, `exitMenu.place: 'page'` only. The row on Account and the title of the page that holds Sign out and Delete account. */
  access: string;
  /** 7.24.0, `exitMenu.place: 'page'` only. The short line under the two rows on that page. */
  accessNote: string;
  /**
   * 7.26.0: optional grey headings over the cards. Empty (the default) draws no heading.
   * Account: the profile card, the data card (Data Export) and the Sign out card. About: the Features/Rate/Share card, the
   * Support/Privacy card and the Kits/Version card (with a heading there, Version comes first).
   */
  profileGroup: string;
  dataGroup: string;
  exitGroup: string;
  aboutAppGroup: string;
  aboutHelpGroup: string;
  aboutInfoGroup: string;
  signOutTitle: string;
  signOutBody: string;
  stayIn: string;
  deleteLoseTitle: string;
  deleteBreakTitle: string;
  deleteBreakAction: string;
  /** The word to type before Delete can go on. */
  deleteTypeWord: string;
  deleteTypeLabel: (word: string) => string;
  continue: string;
  deleteFinalTitle: string;
  deleteFinalPassword: string;
  deleteFinalProvider: string;
  deleteForever: string;
  /** VoiceOver: "Step 2 of 3". */
  stepOf: (step: number, total: number) => string;
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
  /** 7.27.0: "Couldn't open Google Play", for Rate on Android. */
  openPlayStore: string;
}

export const DEFAULT_STRINGS: AccountStrings = {
  settings: 'Settings',
  account: 'Profile',
  myData: 'My data',
  yourData: 'Your data',
  app: 'App',
  nickname: 'Nickname',
  nicknamePlaceholder: 'Add a Nickname',
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
  shareMessage: (appName, url) => `Discover ${appName}: ${url}`,
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
  supportTitle: 'How Can We Help?',
  supportBody: 'A question, an idea or something not quite right? Write to us and a real person will reply.',
  writeToUs: 'Write to us',
  supportNote: 'Your app version and device are added for you, so we can help sooner.',
  notOnStoreYet: 'Available once the app is on the App Store.',
  close: 'Close',
  cancel: 'Cancel',
  done: 'Done',
  lockedHint: 'Available with Premium',
  lockedNote: (choice) => `${choice} is part of the paid plan.`,
  signOut: 'Sign out',
  deleteAccount: 'Delete account',
  deleteTitle: 'Delete your account?',
  deleteWarning: 'This erases every setting and piece of data, and your login. It cannot be undone. Download your data first if you want a copy.',
  deletePassword: 'Enter your password to confirm',
  deleteEverything: 'Delete everything',
  keepAccount: 'Keep my account',
  moreOptions: 'More options',
  access: 'Access',
  accessNote: 'Signing out keeps your data safe. Deleting your account erases it for good, after a few checks.',
  profileGroup: '',
  dataGroup: '',
  exitGroup: '',
  aboutAppGroup: '',
  aboutHelpGroup: '',
  aboutInfoGroup: '',
  signOutTitle: 'Sign out?',
  signOutBody: 'Your data stays safe. Sign in any time to see it again.',
  stayIn: 'Stay signed in',
  deleteLoseTitle: 'You will lose, forever:',
  deleteBreakTitle: 'Just want a break?',
  deleteBreakAction: 'Sign out instead',
  deleteTypeWord: 'DELETE',
  deleteTypeLabel: (word) => `Type ${word} to continue`,
  continue: 'Continue',
  deleteFinalTitle: 'Last step: sign in again',
  deleteFinalPassword: 'For your safety, enter your password one more time.',
  deleteFinalProvider: 'For your safety, confirm it is you with Apple or Google when asked.',
  deleteForever: 'Delete my account forever',
  stepOf: (step, total) => `Step ${step} of ${total}`,
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
  openPlayStore: 'open Google Play',
};

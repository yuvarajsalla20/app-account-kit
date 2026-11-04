/** Every word on the screen, so an app can translate or reword it. */
export interface AccountStrings {
  profile: string;
  nickname: string;
  nicknamePlaceholder: string;
  changePhoto: string;
  takePhoto: string;
  library: string;
  removePhoto: string;
  photoPermission: string;
  changePassword: string;
  changePasswordHelp: (email: string) => string;
  sendLink: string;
  linkSent: (email: string) => string;
  yourData: string;
  about: string;
  share: (appName: string) => string;
  shareMessage: (appName: string, url: string) => string;
  privacy: string;
  contactSupport: string;
  noMail: (email: string) => string;
  version: string;
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
  sendEmail: string;
  download: string;
  shareApp: string;
}

export const DEFAULT_STRINGS: AccountStrings = {
  profile: 'Profile',
  nickname: 'Nickname',
  nicknamePlaceholder: 'Add a nickname',
  changePhoto: 'Change photo',
  takePhoto: 'Take photo',
  library: 'Library',
  removePhoto: 'Remove',
  photoPermission: 'Allow access in your phone settings to use this.',
  changePassword: 'Change password',
  changePasswordHelp: (email) => `We will email a link to ${email} where you can set a new password.`,
  sendLink: 'Send link',
  linkSent: (email) => `We emailed a link to ${email}. Check your inbox, and your spam folder too.`,
  yourData: 'Your data',
  about: 'About',
  share: (appName) => `Share ${appName}`,
  shareMessage: (appName, url) => `Try ${appName}: ${url}`,
  privacy: 'Privacy policy',
  contactSupport: 'Contact support',
  noMail: (email) => `No mail app is set up. Write to ${email}`,
  version: 'Version',
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
  sendEmail: 'send the email',
  download: 'create the file',
  shareApp: 'share the app',
};

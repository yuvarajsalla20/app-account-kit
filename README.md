# app-account-kit

Reusable Account screen for React Native / Expo apps (iOS, Android).
Profile, nickname, photo, change password (its own page), data download, About (share, rate, privacy, support, version), sign out and delete account.
Themeable, with a slot for each app's own settings. No native dependencies of its own: the app supplies the photo picker, the file download and the sign-in calls.
Companion to [app-core-kit](https://github.com/yuvarajsalla20/app-core-kit) and [app-auth-kit](https://github.com/yuvarajsalla20/app-auth-kit).

## What you get

Top to bottom, in this order:

| Part | What it shows | App supplies |
|---|---|---|
| **Profile** | Picture, name, email, Change photo; a card with the nickname and Change password (tap the arrow for a page with Current, New and Confirm password and Save); a "Your data" card with the download row | `profile`, `nickname`, `photo`, `password`, `data` |
| **Your own settings** | Anything the app wants between Profile and About | `children`, built with `SettingsGroup` and `SettingRow` |
| **About** | Share app (only when a link is set), Rate app (iPhone, only when the App Store number is set), Privacy policy, Contact support, Version with its details on the right | `about` |
| **Account actions** | Sign out, then Delete account with a confirmation (password typed only when the login has one) | `actions` |

Every part is optional: leave a prop out and its row is hidden (no `password` for Apple or Google sign-ins, no `data` for an app with nothing to download, no `share.url` or `rate.appStoreId` before the app is in the store).

## Folder layout

```
src/
  AccountScreen.tsx      the screen: puts the parts in order
  context.tsx            theme, wording and text components for everything below; useStyles
  theme.ts  strings.ts   the theme type (the app passes every color) and the English default wording
  types.ts               every prop type, in one place
  hooks/useAction.ts     "busy, then done or failed", used by every part
  logic/                 pure functions, tested without a phone
    nickname.ts  csv.ts  share.ts  rate.ts  password.ts  mail.ts  deleteRules.ts
  ui/                    small pieces: Group, Row, Avatar, Button, Field, Page
  sections/
    ProfileSection.tsx  AboutSection.tsx  ActionsSection.tsx
    profile/            ProfileHeader, NicknameRow, PasswordPage, DataRow
tests/                   logic tests
```

Each file does one job. Nothing is written twice: the button, the row, the card, the text box and the busy handling each exist once.

## Use it

```tsx
import { AccountScreen, SettingRow, SettingsGroup } from 'app-account-kit';

<AccountScreen
  theme={ACCOUNT_THEME}                                   // required: the kit has no colors of its own
  components={{ Text, TextInput }}                       // the app's font-aware components (optional)
  profile={{ name, fallbackName: APP_NAME, email, photo, fallbackPhoto }}
  nickname={{ max: 20, onSave: (name) => saveProfile({ ...profile, name }) }}
  photo={{ pick: pickProfilePhoto, onChange: (photo) => saveProfile({ ...profile, photo }), cameraSupported }}
  password={authKit.hasPassword() ? { onChange: authKit.changePassword } : undefined}   // (current, new) => Promise; sign in again with the current one first
  data={{ label: 'Download my reminders', value: 'CSV', onDownload: exportAll }}
  about={{ appName: APP_NAME, version: { number: '0.2.0', label: VERSION_LABEL }, privacyUrl: PRIVACY_URL, supportEmail: SUPPORT_EMAIL, share: { url: APP_STORE_URL }, rate: { appStoreId: APP_STORE_ID } }}
  actions={{ onSignOut, onDeleteAccount, confirmsWithPassword: authKit.confirmsWithPassword() }}
  describeError={authKit.message}                      // plain words for sign-in errors (optional)
  onError={reportError}
>
  <SettingsGroup title="Reminders">
    <SettingRow icon="clock" tint="#7db7f5" label="Default remind before" value="At time" onPress={...} />
  </SettingsGroup>
</AccountScreen>
```

The app draws its own header (back arrow, title) and page background around `AccountScreen`.

## Helpers you can reuse

The pure functions also live at `app-account-kit/logic`, which loads no React Native, so an app's tests can import them in plain Node.

`toCsv(rows)` and `csvFileName(appName, stem)` build a CSV that opens safely in Excel and Sheets (formula-looking cells are neutralised). `cleanNickname`, `initialOf`, `buildShareMessage`, `canShare`, `canRate`, `reviewUrl`, `passwordProblem`, `supportMailUrl`, `canConfirmDelete` are the small pure functions the parts use. `useAction()` is the busy-then-done-or-failed runner.

## Rules it follows

- The photo contract: `pick` returns a small picture or `null` when cancelled, and throws an `Error("permission")` when access is refused (the kit then shows its permission message).
- The share row never appears without a real `http(s)` link.
- Rate app opens the App Store's own "Write a Review" screen (stars, title and review are entered there; Apple does not allow a custom form). The row shows on iPhone only, and only when `rate.appStoreId` is a number.
- Change password opens a page inside the screen (its own back arrow). Save needs the current password, a new one of at least 6 characters (`minLength` to change), different from the current one, and a matching confirmation. The app's `onChange(current, next)` should sign in again with the current password before updating, because Firebase refuses a change after a long-ago sign-in.
- Contact support opens a mail with the app, version and device already filled in; if no mail app exists it shows the address.
- Delete account is a two-step action, and the confirm button stays off until a password is typed when one is needed.
- The kit has no look of its own. `theme` is required and complete; a missing color is a type error at build time. A test fails if a color literal ever appears in `src/`.
- Every word can be reworded through `strings` (English defaults are built in).

## The theme the app passes

```ts
const ACCOUNT_THEME: AccountTheme = {
  text: '#fff', muted: '#bbb', faint: '#999',
  accent: '#fff', ink: '#2a1062',
  surface: 'rgba(255,255,255,0.15)', border: 'rgba(255,255,255,0.28)', line: 'rgba(255,255,255,0.18)',
  field: 'rgba(255,255,255,0.12)', panel: '#2a1062', danger: '#ffc2c2', on: '#34c759', radius: 22,
  tints: { password: '#f5b266', data: '#7fd9a8', share: '#c3b3ff', rate: '#ffd479', privacy: '#7db7f5', support: '#f48fc1', version: '#b8c4e0' },
};
```

## Install

`"app-account-kit": "git+https://github.com/yuvarajsalla20/app-account-kit.git#<full commit SHA>"` in `package.json`. Pin a full commit SHA, not a tag, so a build always gets exactly the code you tested.
Peer dependencies: `react`, `react-native`, `@expo/vector-icons`.

## Upgrading from 2.x

- `password.onSend` is now `password.onChange(current, next)`.
- The theme needs one more icon color: `tints.rate`.
- Wording: `changePasswordHelp`, `sendLink`, `linkSent`, `sendEmail` are gone; new ones are `currentPassword`, `newPassword`, `confirmPassword`, `savePassword`, `passwordChanged`, `passwordProblem`, `back`, `rate`, `openStore`.

---
Version 3.0.0 - 2026-11-04 6:18 AM CT

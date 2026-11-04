# app-account-kit

Reusable Account screen for React Native / Expo apps (iOS, Android).
Profile, nickname, photo, change password, data download, About (share, privacy, support, version), sign out and delete account.
Themeable, with a slot for each app's own settings. No native dependencies of its own: the app supplies the photo picker, the file download and the sign-in calls.
Companion to [app-core-kit](https://github.com/yuvarajsalla20/app-core-kit) and [app-auth-kit](https://github.com/yuvarajsalla20/app-auth-kit).

## What you get

Top to bottom, in this order:

| Part | What it shows | App supplies |
|---|---|---|
| **Profile** | Picture, name, email, Change photo; a card with the nickname and Change password; a "Your data" card with the download row | `profile`, `nickname`, `photo`, `password`, `data` |
| **Your own settings** | Anything the app wants between Profile and About | `children`, built with `SettingsGroup` and `SettingRow` |
| **About** | Share app (only when a link is set), Privacy policy, Contact support, Version | `about` |
| **Account actions** | Sign out, then Delete account with a confirmation (password typed only when the login has one) | `actions` |

Every part is optional: leave a prop out and its row is hidden (no `password` for Apple or Google sign-ins, no `data` for an app with nothing to download, no `share.url` before the app is in the store).

## Folder layout

```
src/
  AccountScreen.tsx      the screen: puts the parts in order
  context.tsx            theme, wording and text components for everything below; useStyles
  theme.ts  strings.ts   colors and every word, both overridable
  types.ts               every prop type, in one place
  hooks/useAction.ts     "busy, then done or failed", used by every part
  logic/                 pure functions, tested without a phone
    nickname.ts  csv.ts  share.ts  mail.ts  deleteRules.ts
  ui/                    small pieces: Group, Row, Avatar, Button, Field, tints
  sections/
    ProfileSection.tsx  AboutSection.tsx  ActionsSection.tsx
    profile/            ProfileHeader, NicknameRow, PasswordRow, DataRow
tests/                   logic tests
```

Each file does one job. Nothing is written twice: the button, the row, the card, the text box and the busy handling each exist once.

## Use it

```tsx
import { AccountScreen, SettingRow, SettingsGroup } from 'app-account-kit';

<AccountScreen
  theme={{ text: '#fff', accent: '#fff', ink: '#2a1062', surface: 'rgba(255,255,255,0.15)', border: 'rgba(255,255,255,0.28)', danger: '#ffc2c2' }}
  components={{ Text, TextInput }}                       // the app's font-aware components (optional)
  profile={{ name, fallbackName: APP_NAME, email, photo, fallbackPhoto }}
  nickname={{ max: 20, onSave: (name) => saveProfile({ ...profile, name }) }}
  photo={{ pick: pickProfilePhoto, onChange: (photo) => saveProfile({ ...profile, photo }), cameraSupported }}
  password={authKit.hasPassword() ? { onSend: authKit.sendPasswordChange } : undefined}
  data={{ label: 'Download my reminders', value: 'CSV', onDownload: exportAll }}
  about={{ appName: APP_NAME, version: { number: '0.2.0', label: VERSION_LABEL }, privacyUrl: PRIVACY_URL, supportEmail: SUPPORT_EMAIL, share: { url: APP_STORE_URL } }}
  actions={{ onSignOut, onDeleteAccount, confirmsWithPassword: authKit.confirmsWithPassword() }}
  onError={reportError}
>
  <SettingsGroup title="Reminders">
    <SettingRow icon="clock" tint="#7db7f5" label="Default remind before" value="At time" onPress={...} />
  </SettingsGroup>
</AccountScreen>
```

The app draws its own header (back arrow, title) and page background around `AccountScreen`.

## Helpers you can reuse

`toCsv(rows)` and `csvFileName(appName, stem)` build a CSV that opens safely in Excel and Sheets (formula-looking cells are neutralised). `cleanNickname`, `initialOf`, `buildShareMessage`, `canShare`, `supportMailUrl`, `canConfirmDelete` are the small pure functions the parts use. `useAction()` is the busy-then-done-or-failed runner.

## Rules it follows

- The photo contract: `pick` returns a small picture or `null` when cancelled, and throws an `Error("permission")` when access is refused (the kit then shows its permission message).
- The share row never appears without a real `http(s)` link.
- Contact support opens a mail with the app, version and device already filled in; if no mail app exists it shows the address.
- Delete account is a two-step action, and the confirm button stays off until a password is typed when one is needed.
- Every word can be reworded through `strings`; every color through `theme`.

## Install

`"app-account-kit": "git+https://github.com/yuvarajsalla20/app-account-kit.git#<full commit SHA>"` in `package.json`. Pin a full commit SHA, not a tag, so a build always gets exactly the code you tested.
Peer dependencies: `react`, `react-native`, `@expo/vector-icons`.

---
Version 1.0.0 - 2026-11-03 10:30 PM CST

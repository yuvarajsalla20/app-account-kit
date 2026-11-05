# app-account-kit

Reusable Settings screen for React Native / Expo apps (iOS, Android).
Profile, nickname, photo, change password (its own page), data download, About (share, rate, privacy, support, version), sign out and delete account.
Themeable, with a slot for each app's own settings. No native dependencies of its own: the app supplies the photo picker, the file download and the sign-in calls.
Companion to [app-core-kit](https://github.com/yuvarajsalla20/app-core-kit) and [app-auth-kit](https://github.com/yuvarajsalla20/app-auth-kit).

## What you get

A **Settings** screen: a main list, and a page behind each row. Back from a page returns to the list; Back from the list calls the app's `onBack`.

| Page | What it shows | App supplies |
|---|---|---|
| **Main list** | Account, My data, App and About rows, each with an arrow and nothing else, then **Sign out** | `onBack`, `actions.onSignOut` |
| **Account** | Picture, name, email, Change photo; a card with the nickname and Change password (its own page); **Delete account** with a confirmation (password typed only when the login has one) | `profile`, `nickname`, `photo`, `password`, `actions` |
| **My data** | The download row | `data` |
| **App** | The app's own settings | `app: { content }`, built with `SettingsGroup` and `SettingRow` |
| **About** | Share app (only when a link is set), Rate app (iPhone, only when the App Store number is set), Privacy policy, Contact support, Version, and a Kits row when the app passes `kits` | `about` |

Every part is optional: leave a prop out and its row (or page) is hidden.

## Look

The kit has no colors. The app passes a `theme`, and can replace two pieces through `components`: `Card` (draws every card, so an app can use frosted glass) and `Header` (the page title and back arrow), so every page matches the rest of the app.

## Folder layout

```
src/
  SettingsScreen.tsx     the screen: the page switch and the header
  look.ts                the theme, wording and text components every piece reads (useLook, useStyles)
  context.tsx            AccountProvider: fills look.ts and supplies the default Card and Header
  theme.ts  strings.ts   the theme type (the app passes every color) and the English default wording
  types.ts               every prop type, in one place
  kit.ts                 KIT_NAME and KIT_VERSION (a test keeps it equal to package.json)
  hooks/useAction.ts     "busy, then done or failed", used by every part; stops waiting after a timeout (not for actions that wait for the person)
  logic/                 pure functions, tested without a phone
    nickname.ts  csv.ts  share.ts  rate.ts  password.ts  kits.ts  mail.ts  deleteRules.ts  pages.ts
    actionGuard.ts  saveTracker.ts  photo.ts  links.ts  contrast.ts
  ui/                    small pieces: Group, Row, Card, Header, Avatar, Button, Field
  sections/
    HubPage.tsx  AccountPage.tsx  AboutSection.tsx  DeleteAccount.tsx
    profile/            ProfileHeader, NicknameRow, PasswordPage, DataRow
tests/                   logic, contrast, no-own-colors, and the real screens (password, delete, nickname, photo, About) rendered with a small react-native stand-in in tests/stubs
```

Each file does one job. Nothing is written twice: the button, the row, the card, the text box and the busy handling each exist once.

## Use it

```tsx
import { SettingsScreen, SettingRow, SettingsGroup } from 'app-account-kit';

<SettingsScreen
  theme={ACCOUNT_THEME}                                   // required: the kit has no colors of its own
  components={{ Text, TextInput, Card, Header }}          // the app's own text, card and header (all optional)
  onBack={goHome}
  profile={{ name, fallbackName: APP_NAME, email, photo, fallbackPhoto }}
  nickname={{ max: 20, onSave: (name) => saveProfile({ ...profile, name }) }}
  photo={{ pick: pickProfilePhoto, onChange: (photo) => saveProfile({ ...profile, photo }), cameraSupported }}
  password={authKit.hasPassword() ? { onChange: authKit.changePassword } : undefined}   // (current, new) => Promise; sign in again with the current one first
  data={{ label: 'Download my reminders', value: 'CSV', onDownload: exportAll }}
  about={{ appName: APP_NAME, version: { number: '0.2.0', label: VERSION_LABEL }, privacyUrl: PRIVACY_URL, supportEmail: SUPPORT_EMAIL, share: { url: APP_STORE_URL }, rate: { appStoreId: APP_STORE_ID }, kits: kitsLine({ core: CORE_KIT_VERSION, auth: AUTH_KIT_VERSION, account: KIT_VERSION }) }}
  actions={{ onSignOut, onDeleteAccount, confirmsWithPassword: authKit.confirmsWithPassword() }}
  describeError={authKit.message}                      // plain words for sign-in errors (optional)
  onError={reportError}
  app={{ content: (
    <SettingsGroup>
      <SettingRow icon="clock" tint="#7db7f5" label="Default remind before" value="At time" onPress={...} />
    </SettingsGroup>
  ) }}
/>
```

The app draws its own page background around `SettingsScreen`; the kit draws the headers.

## Helpers you can reuse

The pure functions also live at `app-account-kit/logic`, which loads no React Native, so an app's tests can import them in plain Node.

`toCsv(rows)` and `csvFileName(appName, stem)` build a CSV that opens safely in Excel and Sheets (formula-looking cells are neutralised). `cleanNickname`, `initialOf`, `buildShareMessage`, `canShare`, `kitsLine`, `canRate`, `reviewUrl`, `passwordProblem`, `supportMailUrl`, `canConfirmDelete`, `hubPages`, `parentOf` are the small pure functions the parts use. `useAction()` is the busy-then-done-or-failed runner. Also exported: `isHttps` and `isEmail` (link checks), `safePhoto` and `isPermissionError` (photo checks, `DEFAULT_PHOTO_MAX_CHARS`), `createActionGuard` (the timeout and double-tap guard behind `useAction`, `DEFAULT_ACTION_TIMEOUT_MS`), `createSaveTracker`, and `CSV_BOM` (`toCsv(rows, { bom: true })` adds it for Excel).

## Versions

- Every release is tagged in git (`v4.1.0`). In the app's `package.json` pin the full commit SHA of that tag and write the tag in a comment, so the version is readable and the build is exact.
- With several kits, pin each one separately and upgrade one kit at a time.
- Each kit exports `KIT_VERSION`. The app collects them with `kitsLine({ core, auth, account })` and passes the line as `about.kits`: it shows as a Kits row in About and is added to support emails. Without `kits`, support emails carry this kit's version alone.

## Rules it follows

- The photo contract: `pick` returns a small picture or `null` when cancelled, and throws an `Error("permission")` when access is refused (the kit then shows its permission message).
- The share row never appears without a real `https` link.
- Rate app opens the App Store's own "Write a Review" screen (stars, title and review are entered there; Apple does not allow a custom form). The row shows on iPhone only, and only when `rate.appStoreId` is a number.
- Change password opens a page inside the screen (its own back arrow). Save needs the current password, a new one of at least 8 characters, the same as app-auth-kit (`minLength` to change; Firebase itself accepts 6), different from the current one, and a matching confirmation. The app's `onChange(current, next)` should sign in again with the current password before updating, because Firebase refuses a change after a long-ago sign-in.
- Contact support opens a mail with the app, version and device already filled in; if no mail app exists it shows the address.
- Android's Back button steps back through the pages like the arrow, and does nothing while a save or delete runs (a save or delete that runs past `actionTimeoutMs`, 45 seconds by default, is released with a "taking too long, it may still finish" message so the screen never stays stuck; share and photo picking wait for the person and are never cut off); from the main list it is left to the app.
- Delete account is a two-step action, and the confirm button stays off until a password is typed when one is needed.
- The kit has no look of its own. `theme` is required and complete; a missing color is a type error at build time. A test fails if a color literal ever appears in `src/`.
- Every word can be reworded through `strings` (English defaults are built in).

## The theme the app passes

```ts
const ACCOUNT_THEME: AccountTheme = {
  text: '#fff', muted: '#d6cdf0', faint: '#b9aedd',
  accent: '#fff', ink: '#2a1062',
  surface: 'rgba(255,255,255,0.15)', border: 'rgba(255,255,255,0.28)', line: 'rgba(255,255,255,0.18)',
  field: 'rgba(255,255,255,0.12)', panel: '#2a1062', danger: '#ffc2c2', on: '#34c759', radius: 22,
  tints: { account: '#c3b3ff', app: '#93a4ff', about: '#7db7f5', password: '#f5b266', data: '#7fd9a8', share: '#c3b3ff', rate: '#ffd479', privacy: '#7db7f5', support: '#f48fc1', version: '#b8c4e0' },
};
```

## Install

`"app-account-kit": "git+https://github.com/yuvarajsalla20/app-account-kit.git#<full commit SHA>"` in `package.json`. Pin a full commit SHA, not a tag, so a build always gets exactly the code you tested.
Peer dependencies: `react`, `react-native`, `@expo/vector-icons`.

## Keep these stable

`theme`, `strings` and `components` are read through one memoised provider. Define them once, outside your component (or in `useMemo`), and pass the same objects every render. A new object each render rebuilds every style in the screen. Pass `onBack`, `onSave` and the other callbacks however you like.

## Checking your colors

The kit cannot see your colors until you hand them over, so check them yourself, in a test or at start-up in development:

```ts
import { themeContrast } from 'app-account-kit/logic';
const problems = themeContrast(ACCOUNT_THEME, '#3b1d8f'); // your page's solid background color
// [] when all is readable, else [{ pair: 'muted on surface', ratio: 4.15, min: 4.5 }, ...]
```

It checks text against the cards, boxes and delete panel it sits on (4.5 for text, 3 for the chevron), and lists a color it cannot read (a color name) rather than passing it. Icon tints are not checked.

## Upgrading from 4.2 to 5.0

- The main list shows each row with an arrow only: no email, "CSV", hint or version on the right. The same details are one tap away (email on Account, version on About). This also stops a long email squeezing the "Account" label onto two lines.
- Breaking: `app.hint` is removed, because nothing shows it any more. Delete it from your app; TypeScript points at it. `data.value` stays: it is still shown beside the download row on the My data page.

## Upgrading from 4.2.0 to 4.2.1

- The kit now imports only the Feather icon set (`@expo/vector-icons/Feather`), not the whole icon package. An app that used only this kit's icons no longer ships every icon set and its fonts (about 450 KB less code and several MB less in fonts). Nothing to change in your app.

## Upgrading from 4.1.x to 4.2

- The default minimum new password is now 8 (was 6), matching app-auth-kit. Pass `password.minLength` to keep another number.
- A save or delete that runs past `actionTimeoutMs` now shows `strings.tookTooLong` ("it may still finish") instead of "Could not save". Share, the photo picker, camera and library wait for the person and have no time limit. `useAction().run(where, action, failure, { patient: true })` does the same for your own actions.
- New: `themeContrast(theme, background)`; `strings.tookTooLong`; `ActionRunner.noteKey`. `useAction` takes a fourth argument, the "too long" text.
- The delete panel no longer pulls screen-reader focus back each time the screen re-renders. A failed nickname save keeps what was typed. The same message shown twice is announced twice. The password page moves from box to box with the keyboard's Next key.
- `"sideEffects": false` lets your bundler drop what you do not import.
- The grey text colors in the README's example theme were too faint (muted 4.15, faint 2.8 against the card); the example now passes `themeContrast`.

## Upgrading from 4.0.x to 4.1

- A save, delete or other action now gives up after `actionTimeoutMs` (default 45 s), so the screen can no longer stay stuck on a stalled network.
- `actions.onSignOut` may be async; a failure shows a message. `onDeleteAccount` must confirm the person's identity itself (see its comment in `types.ts`).
- Photos from `photo.pick` are checked: only small jpeg/png/webp data or https addresses are kept (`photo.maxChars` sets the limit). A refused photo shows `strings.photoInvalid`.
- The data download keeps plain numbers as numbers (`-12.50` is no longer prefixed). `toCsv(rows, { bom: true })` adds the marker Excel needs for accents; `csvFileName` always returns a safe name.
- The privacy and share links must be https. The support address cannot add a recipient.
- Messages now appear in the danger color for failures and the accent color for successes, and the page scrolls to them.
- New strings: `nicknameSaved`, `signOutAction`, `openLink`, `photoInvalid`.

## Upgrading from 3.x to 4.x

- `AccountScreen` is now `SettingsScreen`, with a page behind each row (Account, My data, App, About).
- `children` is replaced by `app={{ content }}`. `onBack` is required (Back from the main list).
- Strings `profile` and `yourData` are now `account` and `myData`; new `settings` and `app`.
- The theme needs three more icon colors: `tints.account`, `tints.app`, `tints.about`.
- Sign out moved to the main list, and Delete account to the Account page.
- New optional `components.Card` and `components.Header`, so the app draws the cards and page titles.

## Upgrading from 2.x

- `password.onSend` is now `password.onChange(current, next)`.
- The theme needs one more icon color: `tints.rate`.
- Wording: `changePasswordHelp`, `sendLink`, `linkSent`, `sendEmail` are gone; new ones are `currentPassword`, `newPassword`, `confirmPassword`, `savePassword`, `passwordChanged`, `passwordProblem`, `back`, `rate`, `openStore`.

---
Version 5.0.0 - 2026-11-04 11:47 PM CT

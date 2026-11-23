# app-account-kit

A complete, themeable **Settings screen** for React Native and Expo apps (iOS and Android): profile, nickname, photo, change password, data download, About (features, rate, share, contact support, privacy, kits, version), sign out and delete account. It has no colors and no native dependencies of its own. The app supplies the theme, the photo picker, the file download and the sign-in calls.

**Current version: 7.38.0** (tag `v7.38.0`)

Part of the shared kits:
[app-core-kit](https://github.com/yuvarajsalla20/app-core-kit) ·
[app-auth-kit](https://github.com/yuvarajsalla20/app-auth-kit) ·
**app-account-kit** ·
[app-settings-kit](https://github.com/yuvarajsalla20/app-settings-kit) ·
[app-subscriptions-kit](https://github.com/yuvarajsalla20/app-subscriptions-kit) ·
[app-payments-kit](https://github.com/yuvarajsalla20/app-payments-kit) ·
[app-export-kit](https://github.com/yuvarajsalla20/app-export-kit) ·
[app-guard-kit](https://github.com/yuvarajsalla20/app-guard-kit) ·
[app-theme-kit](https://github.com/yuvarajsalla20/app-theme-kit) ·
[app-invite-kit](https://github.com/yuvarajsalla20/app-invite-kit) ·
[app-goldrates-api-kit](https://github.com/yuvarajsalla20/app-goldrates-api-kit)

Tools that work alongside them: [code-review-kit](https://github.com/yuvarajsalla20/code-review-kit) (reviews) and app-insights-kit (store numbers, private).

> Most apps should not use this kit directly. [app-settings-kit](https://github.com/yuvarajsalla20/app-settings-kit) builds the standard Settings (About, Profile, Preferences, Premium) on top of it from one config. Use this kit directly when you need a page layout the settings kit does not offer, or its building blocks (`SettingRow`, `PickerRow`, `ChoiceSheet`) on your own pages.

## Install

Pin the full commit SHA of a release tag, so every build gets exactly the code you tested, and write the tag next to it so the version stays readable:

```jsonc
// package.json
"dependencies": {
  "app-account-kit": "git+https://github.com/yuvarajsalla20/app-account-kit.git#<full SHA of v7.38.0>"
},
"kitVersions": {
  "app-account-kit": "v7.36.0"
}
```

Find the SHA with `git ls-remote https://github.com/yuvarajsalla20/app-account-kit refs/tags/v7.36.0`.

**Peer dependencies:** `react` ≥ 18, `react-native` ≥ 0.74, `@expo/vector-icons` ≥ 14 (only the Feather set is imported). Optional, only for `app-account-kit/photo`: `expo-image-picker` and `expo-image-manipulator`.

## Entry points

| Import | What it holds |
|---|---|
| `app-account-kit` | The screen, the provider, the UI pieces, the hooks and every helper |
| `app-account-kit/logic` | The pure helpers only. Loads no React Native, so an app's tests can import them in plain Node |
| `app-account-kit/photo` | 7.29.0: `pickProfilePhoto` and `cameraSupported`, the profile photo picker (a 256 px square JPEG under `DEFAULT_PHOTO_MAX_CHARS`). Pass them as `photo={{ pick: pickProfilePhoto, cameraSupported, onChange }}` |
| `app-account-kit/package.json` | The kit's own `version`, for an About > Kits list |

## What you get

A **Settings** screen: a main list, and a page behind each row. Back from a page returns to the page above it; Back from the main list calls the app's `onBack`. Every part is optional: leave a prop out and its row (or page) is hidden.

| Page | What it shows | App supplies |
|---|---|---|
| **Main list** | Account, My data, App and About rows (and the app's own pages), each with an arrow; then **Sign out** (outlined) and **Delete account** (red outline) side by side. Delete opens a confirmation panel, with the password typed only when the login has one | `onBack`, `actions`, `extraPages`, `hubOrder` |
| **Account** | Picture, name and Change photo; one card with the nickname, the email (read only) and Change password (its own page); then a card with each added page that has `under: 'account'` | `profile`, `nickname`, `photo`, `password`, `extraPages` |
| **My data** | The download row (one format downloads on tap, two or more open a chooser) | `data` |
| **App** (rename it "Preferences" with `strings.app`) | The app's own settings; then a card with each added page that has `under: 'app'`, and a titled card for each `group` | `app.content`, `extraPages` |
| **About** | The app's picture and name in `theme.brand`, then three cards: **Features**, Rate, Share; **Contact Support**, each added page that has `under: 'about'` (a help page), Privacy policy; **Kits** and **Version** | `about`, `extraPages` |
| **Contact Support** (from About) | A short welcome and one **Write to Us** button that writes the email with the app, version, device and kits already filled in. When no mail app is set up, it shows the address | `about.supportEmail` |
| **Change password** (from Account) | Current, new and confirm boxes | `password` |

## Quick start

```tsx
import { SettingsScreen, SettingsGroup, SettingRow, type AccountTheme } from 'app-account-kit';

// Define these once, outside the component (see "Keep these stable").
const THEME: AccountTheme = { /* see "Theming" */ };
const STRINGS = { app: 'Preferences' };

export function Settings() {
  return (
    <SettingsScreen
      theme={THEME}
      strings={STRINGS}
      components={{ Text, TextInput, Card }}                  // optional: the app's own text and cards
      onBack={goHome}
      profile={{ name, fallbackName: APP_NAME, email, photo, fallbackPhoto }}
      nickname={{ max: 20, onSave: (name) => saveProfile({ name }) }}
      photo={{ pick: pickPhoto, onChange: (photo) => saveProfile({ photo }), cameraSupported: true }}
      password={auth.hasPassword() ? { onChange: auth.changePassword } : undefined}
      data={{ label: 'Download My Data', formats: [{ id: 'csv', label: 'CSV', onDownload: exportCsv }] }}
      about={{
        appName: APP_NAME,
        logo: require('./assets/icon.png'),
        version: { number: '1.0.0', label: 'v1.0.0', lines: ['v1.0.0 | Build 12', 'Nov 15, 2026 | 9:00 AM CT'] },
        featuresUrl: 'https://example.com/features',
        privacyUrl: 'https://example.com/privacy',
        supportEmail: 'support@example.com',
        share: { url: APP_STORE_URL },
        rate: { appStoreId: APP_STORE_ID },
        kits: [{ name: 'Account Kit', version: '7.30.0', build: 'da25d6e' }],
      }}
      actions={{ onSignOut: auth.signOut, onDeleteAccount: auth.deleteAccount, confirmsWithPassword: auth.confirmsWithPassword() }}
      describeError={auth.message}
      onError={reportError}
      app={{
        content: (
          <SettingsGroup>
            <SettingRow icon="clock" tint={THEME.tints.app} label="Default Reminder" value="At Time" onPress={openPicker} last />
          </SettingsGroup>
        ),
      }}
    />
  );
}
```

The app draws its own page background around `SettingsScreen`; the kit draws the page headers and cards.

## `SettingsScreen` props

| Prop | Type | Notes |
|---|---|---|
| `theme` | `AccountTheme` | **Required.** Every color and radius (see Theming) |
| `strings` | `Partial<AccountStrings>` | Reword anything. English defaults are in `DEFAULT_STRINGS` |
| `components` | `Partial<AccountComponents>` | `Text`, `TextInput`, `Card`, and optional `BackButton`, `EdgeSwipe`, `Sheet` |
| `onBack` | `() => void` | **Required.** Back from the main list |
| `backLabel` | `string` | What the Back button says on the main list |
| `brand` | `ReactNode` | The app's logo and name, centred in the top row of every page except About |
| `footer` | `ReactNode` | Optional. Drawn centred at the very end of the main list, under Sign out and Delete account (main list only) |
| `footerOnEveryPage` | `boolean` | Optional (7.15.0). Also draw `footer` at the end of every other Settings page. Default false |
| `top` | `ReactNode \| (page) => ReactNode` | Optional (7.17.0). Drawn at the very top of the main list, under the header (the app's logo and tagline, say). A function gets the page id, to draw it differently per page |
| `topOnEveryPage` | `boolean` | Optional (7.17.0). Also draw `top` at the top of every other Settings page. Default false |
| `exitMenu` | `ExitMenuProps` | Opt-in (7.17.0). Sign out and Delete account leave the main list and sit behind a ⋯ button on Account, each on its own page. Delete goes through steps: the app's optional `unlock(onUnlocked)` (Face ID or PIN, drawn by the app), what will be lost (`losses`) with "Sign out instead", typing DELETE, then the password (or Apple / Google) before `onDeleteAccount`. `components.Menu` can draw the ⋯ menu in the app's own style. `place: 'page'` (7.24.0) swaps the ⋯ for an Access row at the bottom of Account that opens a page with both; add `signOutOnAccount: true` (7.25.0) to make Sign out its own row on Account and leave only Delete account on that page. Leave out and nothing changes |
| `profile` | `ProfileInfo` | **Required.** `{ name, fallbackName, email, photo, fallbackPhoto?, centered? }`. `centered` (7.22.0): a bigger photo in the middle with a pencil on its corner, no name or "Change photo" beside it |
| `nickname` | `NicknameProps` | **Required.** `{ max, onSave(name) }` |
| `photo` | `PhotoProps` | `{ pick(source), onChange(photo), cameraSupported, maxChars? }`. Leave out to hide Change photo |
| `password` | `PasswordProps` | `{ onChange(current, next), minLength? }` (default 8). Leave out for Apple or Google sign-in |
| `data` | `DataProps` | `{ label, formats: [{ id, label, onDownload }] }`. Leave out to hide My data |
| `about` | `AboutProps` | **Required.** See below |
| `actions` | `ActionsProps` | **Required.** `{ onSignOut?, onDeleteAccount?(password), confirmsWithPassword }` |
| `app` | `{ content: ReactNode }` | The App page. Leave out to hide it (unless an added page lives under it) |
| `extraPages` | `ExtraPage[]` | The app's own pages (see below) |
| `hubOrder` | `string[]` | Order of the main list, such as `['app', 'premium', 'account', 'about']`. Pages left out follow in the default order |
| `describeError` | `(error) => string \| null` | Turns a sign-in error into plain words |
| `actionTimeoutMs` | `number` | How long a save or delete may run before the screen stops waiting. Default 45 000 |
| `onError` | `(where, error) => void` | Quiet failures, for crash reporting |

### `about`

| Field | Notes |
|---|---|
| `appName` | Shown under the logo, in `theme.brand` |
| `logo` | `require('./assets/icon.png')` or `{ uri }` (84 pt rounded square), or (7.21.0) a drawn element such as `<MyLogo />`, shown at its own size |
| `showHeader` | Optional (7.16.0). `false` leaves out the logo and name at the top of About (when the app shows its brand elsewhere, e.g., in `footer`). The page then keeps its normal header with the title About (7.16.1). `'logo'` (7.30.0) keeps the title About in the header and shows the logo alone under it at 104 pt, with rounded corners and a soft shadow, without the app name; app-settings-kit uses this. Default true |
| `version` | `{ number, label, lines? }`. `number` goes into support emails; the Version row shows `lines` (one per line), or `label` |
| `privacyUrl` | https only |
| `featuresUrl` | Adds a Features row that opens this https page |
| `supportEmail` | Used by Contact Support. It cannot add a second recipient |
| `share` | `{ url?, message? }`. 7.29.0: the Share row shows only when `url` is an https link; an empty object or an empty or http `url` shows nothing |
| `rate` | `{ appStoreId?, playPackage? }`. 7.29.0: the Rate row shows on iPhone only when `appStoreId` is the App Store number (digits), and opens the App Store's own review screen; on Android only with `playPackage` |
| `kits` | A list of `{ name, version, build? }`, shown as "Account Kit \| v7.30.0 \| Build da25d6e", or the older one-line text from `kitsLine`. Also added to support emails |

### Added pages (`extraPages`)

Each entry is `{ id, label, icon, content, tint?, value?, badge?, under?, group?, toggle? }`. The kit knows nothing about what a page holds.

| `under` | Row shows on | Back returns to |
|---|---|---|
| left out | the main list, as a parent of its own (a Premium page) | the main list |
| `'account'` | the Account page, in its own card | Account |
| `'app'` | the App page, in a card under the app's own settings. Add `group: 'On Your iPhone'` to put it in a titled card | App |

```tsx
extraPages={[
  { id: 'premium', label: 'Premium', icon: 'award', content: <PremiumRows />, badge: <PlanPill /> },
  { id: 'export', label: 'Data Export', icon: 'download', content: <ExportRows />, under: 'app' },
  { id: 'widgets', label: 'Home Screen Widgets', icon: 'grid', content: <WidgetHelp />, under: 'about' }, // a help page: About, not Preferences
  { id: 'effects', label: 'Background Effects', icon: 'wind', content: null, under: 'app', group: 'Personalize', premium: true, toggle: { value: on, onChange: setOn } },
]}
```

`toggle` (7.36.0) makes the row an on/off switch at the same size as every other row, and it opens no page. A tap anywhere on the row flips it.

`id` must be unique and not one of the kit's own pages (`RESERVED_PAGE_IDS`: `hub`, `account`, `data`, `app`, `about`, `password`, `support`, `signOut`, `deleteAccount`, `access`). Since 7.29.0 a page with one of those ids is left out and reported through `onError('extraPages', …)` (and a console warning in development). Rows keep the order of `extraPages`.

`plainHeader: true` (7.19.0) gives that one page a plain header: no `brand`, and the page title in the top row on the left, beside Back. Other pages keep the brand. `plainHeaders` on `SettingsScreen` (7.20.0) does the same on every page, the main list included.

From inside an added page, `useSettingsNav()?.open('export')` opens any other Settings page; Back then returns to the page that opened it.

## Building blocks

Use these on the app's own pages (inside `app.content` or an added page) so they match the kit:

| Export | Use |
|---|---|
| `SettingsGroup` | A card that holds rows |
| `SettingRow` | `icon`, `tint`, `label`, plus `detail`, `value`, `badge`, `onPress`, `toggle: { value, onChange }`, `external` (slanted arrow), `expanded`, `locked` (padlock), `premium` (7.34.0: the gold Premium tag after the label, and a gold padlock when locked), `trailing` (icon in place of the arrow), `disabled`, `last`, `children` |
| `PremiumTag`, `PremiumLock`, `premiumGold` | 7.34.0: the gold Premium tag and padlock for an app's own rows, in `theme.premium` (default `tints.rate`, the comparison table's gold) |
| `PickerRow` | A row showing the current choice; a tap opens a `ChoiceSheet`, or the pull-down menu with `pickers: 'pullDown'`. `options`, `value`, `onChange`, `title?`, `detail?`. 7.33.0: `onPick` (every pick, e.g., to play a sound), `locked` and `onLocked` for paid options (a padlock in the menu), `note` (a line at the top of the menu), and `lead` on an option (an icon before its label) |
| `ExpandRow` | A row that opens its content right below it |
| `MenuRow`, `PullDownMenu`, `PullDownPill`, `useAnchor` | The iOS-style pull-down menu. It opens over the row that opened it, with a tick on the chosen line. 7.32.0: each `PullDownItem` can take `lead` (an icon before the label), `dot` (a color dot), `locked` (a padlock) and `group` (a thin line above) |
| `ChoiceSheet` | A bottom sheet of options. Add `onConfirm` to ask before keeping (✕ and ✓), `locked(value)` and `onLocked` for paid options, `onPick` (for example to play a sound), `note` |
| `Avatar`, `Button`, `Field` | The kit's picture (7.23.0: `style` and `initialStyle` let an app use it outside Settings in its own look, inside `AccountProvider`), button (`solid`, `quiet`, `danger`, `outline`, `line`) and text box |
| `AccountProvider` | Gives these pieces the theme when they are used outside `SettingsScreen` |
| `useAction()` | The "busy, then done or failed" runner every part uses, with a timeout and a double-tap guard |

## Theming

The kit has no look of its own. `theme` is required and complete, so a missing color is a type error at build time, and a test fails if a color literal ever appears in `src/`.

```ts
import type { AccountTheme } from 'app-account-kit';

export const THEME: AccountTheme = {
  text: '#0e2b28', muted: '#3c5e59', faint: '#4f706b',
  accent: '#0f766e', ink: '#ffffff',                     // primary buttons, and what sits on them
  surface: '#ffffff', border: '#cbe6e0', line: '#ddede9',
  field: '#f0f9f7', panel: '#ffffff',                   // text boxes, and the delete panel
  danger: '#b91c1c', on: '#166534',                     // switches and picker ticks
  brand: '#0f766e',                                     // the app's name on About
  scrim: 'rgba(0,0,0,0.45)',                            // behind a sheet
  radius: 22,
  tints: {
    account: '#7db7f5', app: '#93a4ff', about: '#4fd1c0', password: '#f5b266', data: '#7fd9a8',
    share: '#c3b3ff', rate: '#ffd479', privacy: '#7db7f5', support: '#f48fc1', version: '#b8c4e0',
    features: '#4fd1c0',                                // optional, defaults to `about`
  },
  backSize: 17,                                         // optional, size of the word Back (default 14)
  lock: { icon: '#8a6d1f', circle: '#fbf1d6' },        // optional, the padlock on paid options
  menu: 'rgba(246,251,250,0.78)',                       // optional, a pull-down menu's fill (default `surface`)
  menuEdge: 'rgba(14,43,40,0.55)',                      // optional, its thin outline (default `text` at 55%)
};
```

**Custom pieces through `components`:**

| Component | Default | Use it for |
|---|---|---|
| `Text`, `TextInput` | React Native's | The app's font |
| `Card` | `theme.surface` with `theme.border` | Frosted glass or a shadow. Receives `radius` |
| `BackButton` | The kit's arrow and word | One Back button across the whole app. Receives `onPress`, `label` |
| `EdgeSwipe` | none | Swipe back from the left edge. Receives `onBack`, `children` |
| `Sheet` | The kit's sheet | The app's own bottom sheet around an ask-before-keeping picker |
| `MenuBackdrop` | none | 7.32.0: drawn behind every pull-down menu, such as expo-blur's `BlurView`, so the menu reads as frosted glass. Receives `style` |

**Check your colors** in a test or at start-up in development:

```ts
import { themeContrast } from 'app-account-kit/logic';

themeContrast(THEME, '#e8f6f3'); // your page background
// [] when everything is readable, otherwise [{ pair: 'muted on surface', ratio: 4.15, min: 4.5 }, ...]
```

### Keep these stable

`theme`, `strings` and `components` go through one memoised provider. Define them once, outside your component (or in `useMemo`). A new object each render rebuilds every style in the screen. Callbacks can be passed however you like.

## Helpers

Exported from both `app-account-kit` and `app-account-kit/logic`:

| Helper | What it does |
|---|---|
| `hubPages`, `parentOf` | Which rows the main list shows, and where Back goes from a page |
| `passwordProblem`, `MIN_PASSWORD` | Checks a new password (8 characters by default) |
| `canConfirmDelete` | Whether the delete button can be pressed yet |
| `cleanNickname`, `initialOf` | Tidies a nickname; the letter shown when there is no photo. Call `initialOf(nickname, email)` for an avatar outside Settings so it matches |
| `safePhoto`, `DEFAULT_PHOTO_MAX_CHARS` | Accepts only small jpeg, png or webp data (80,000 characters by default since 7.29.0, the apps' Firestore limit), or https links |
| `isHttps`, `isEmail` | Link checks |
| `buildShareMessage`, `canShare` | The Share text, and whether the link is real |
| `canRate`, `reviewUrl`, `reviewWebUrl` | The App Store review links |
| `supportMailUrl` | The support email with app, version, device and kits filled in |
| `kitLines`, `kitListLines`, `kitsLine`, `kitsMailLine` | Kit lines for About and support emails |
| `themeContrast` | The contrast check above |
| `toCsv`, `csvFileName`, `CSV_BOM` | **Deprecated**: use [app-export-kit](https://github.com/yuvarajsalla20/app-export-kit). Removed in 8.0.0 |

`app-account-kit/logic` also exports `createActionGuard`, `DEFAULT_ACTION_TIMEOUT_MS`, `createSaveTracker` and `isPermissionError`.

## Rules it follows

- **Photos:** `pick` returns a small picture or `null` when cancelled, and throws `Error('permission')` when access is refused (the kit then shows its permission message).
- **Passwords:** Save needs the current password, a new one of at least 8 characters (the same as app-auth-kit), different from the current one, and a matching confirmation. `onChange(current, next)` should sign in again with the current password first, because Firebase refuses a change after an old sign-in.
- **Delete account** is two steps. The confirm button stays off until a password is typed when one is needed. `onDeleteAccount` must confirm the person's identity itself (as app-auth-kit's `deleteAccount` does), because the kit cannot see who is asking.
- **Timeouts:** a save or delete that runs past `actionTimeoutMs` is released with "taking too long, it may still finish", so the screen never stays stuck. Share, the photo picker and Apple or Google confirmation sheets wait for the person and are never cut off.
- **Android Back** steps through the pages like the arrow, and does nothing while a save or delete runs. On the main list it is left to the app.
- **Rate** opens the App Store's own "Write a Review" screen (Apple allows no custom form), on iPhone only.
- **Wording:** every word can be changed through `strings`.

## Folder layout

```
src/
  SettingsScreen.tsx   the screen: page switch and header
  context.tsx          AccountProvider
  look.ts              theme, wording and components every piece reads (useLook, useStyles)
  nav.ts               useSettingsNav
  theme.ts strings.ts  the theme type and the English wording
  types.ts             every prop type
  kit.ts               KIT_NAME and KIT_VERSION (a test keeps it equal to package.json)
  hooks/useAction.ts
  logic/               pure functions, tested without a phone
  ui/                  Group, Row, ExpandRow, PickerRow, ChoiceSheet, Card, Header, Avatar, Button, Field
  sections/            HubPage, AccountPage, AppPage, AboutSection, SupportPage, DeleteAccount, profile/
tests/                 logic, contrast, "no colors of its own", and the real screens rendered with a small React Native stand-in
```

## Development

```bash
npm install
npm run typecheck
npm test
```

To release: bump `version` in `package.json` and `KIT_VERSION` in `src/kit.ts` (a test checks they match), add an entry to [CHANGELOG.md](CHANGELOG.md), and merge. The `version-tag` workflow tags the merged commit as `v<version>` by itself, and fails a pull request whose version is not higher than the latest tag.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for every release and the upgrade guides between major versions.

## Page rule

Every page has one job, as set out in the shared [Page rule](https://github.com/yuvarajsalla20/app-settings-kit#page-rule-every-page-has-one-job). Account holds who you are and your account; the App page (Preferences) holds choices that change how the app behaves; About holds the app, help and legal. A page with nothing to set, such as how to add a widget, goes under About with `under: 'about'`, never under Preferences.

## Writing rule

Every word this kit shows, and every line of its documentation, follows the shared [Writing rule](https://github.com/yuvarajsalla20/app-settings-kit#writing-rule-every-word-is-professional): Title Case for titles, rows and buttons; calm, complete sentences for captions and messages; "e.g.," for examples; no chatty fragments, slang or exclamation marks. Apps do not override these words; a change is made in the kit so that every app receives it.

## License

MIT

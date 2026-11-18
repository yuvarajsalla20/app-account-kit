# Changelog

Release notes for app-account-kit, newest first. Each version is tagged in git (`v7.12.0`). Upgrade guides for the major versions follow the release notes.

## 7.15.0

- **Footer on every page (opt-in):** new optional `footerOnEveryPage` prop on `SettingsScreen`. When true, the `footer` node is also drawn centred at the end of every other Settings page (About, Account, the App page, extra pages). Default false: the footer stays on the main list only, so nothing changes for apps that leave it out.

## 7.14.0

- **Fewer redraws:** `SettingsScreen` / `AccountProvider` compare `theme`, `strings` and `components` by their contents, so an app passing them inline (a new object each render) no longer rebuilds every row's styles. Nothing to change in apps.

## 7.13.0

- **Footer on the main list:** new optional `footer` prop on `SettingsScreen`. The app's node (such as its logo and tagline) is drawn centred at the very end of the main list, under Sign out and Delete account. Shown on the main list only. Nothing changes for an app that leaves it out.

## 7.12.0

- **Contact Support is its own page:** the About row no longer opens in place to show the address. It opens a page (Back returns to About) with a mail badge, a heading (`supportTitle`), a line under it (`supportBody`), one **Write to Us** button (`writeToUs`) that writes the email with the app version, device and kits already in it, and a small note saying so (`supportNote`). If no mail app is set up, the address shows in the note at the top, as before.
- `parentOf('support')` is `'about'`. `supportHint` is no longer shown (still accepted).

## 7.11.0

- **Headings for rows on the App page (Preferences):** an `extraPages` entry with `under: 'app'` can take `group: 'On Your iPhone'`. Rows with the same group share one card under that heading, after the untitled card (Data Export). Nothing changes for rows without a group.
- `appGroups(pages)` is the pure rule behind it.

## 7.10.0

- **A page can live inside the App page (Preferences):** an `extraPages` entry with `under: 'app'` is a row on the App page, in its own card under the app's settings, with its `value` and `badge`; Back from it returns to App. If the app passes no `app` settings but has such a page, the App row still shows. Used by app-settings-kit 2.2 to put Data Export and the app's own pages (Connect as Family) inside Preferences.
- `parentOf(page, accountPages?, appPages?)` takes the ids of the pages under App as a third, optional list.
- `HubPage` takes an optional `hasApp` (default `!!app`).
- Nothing changes for an app that does not use `under: 'app'`: the defaults are exactly as in 7.9.0.

## 7.9.0

- The app's `under: 'account'` pages (Data Export) sit straight on Account in their own card, with no "Your data" heading. `strings.yourData` is no longer shown (kept so older apps compile).
- `ChoiceSheet` can ask before keeping: pass `onConfirm` and a tap only moves the tick, ✓ keeps it, ✕ leaves the old choice. The options are large rounded buttons, the chosen one in the accent. An app with its own sheet passes it as `components.Sheet` so every sheet matches.
- `ChoiceSheet` locks: `locked(value)` puts a padlock on an option that needs the paid plan (colors from the new optional `theme.lock`), `onLocked` opens the plans, and without it the sheet says "&lt;Option&gt; is part of the paid plan." (`strings.lockedNote`). Also `onPick` (play a sound on tap) and `note`.
- `SettingRow` gains `locked` (a padlock on `theme.lock` in place of the arrow, read as "locked") and `trailing` (an icon in place of the arrow, such as "download").
- New strings `cancel`, `done`, `lockedHint`, `lockedNote`. Nothing else changes for existing apps.
- An app that builds a whole `AccountStrings` object (not a partial one) must add those four words.
- Delete account waits for the person while Apple's or Google's confirmation sheet is open, instead of saying "taking too long" after 45 seconds.
- The ask-before-keeping options tell screen readers they are `checked`, as radio buttons should (TalkBack reads that).
- `toCsv`, `CSV_BOM` and `csvFileName` are marked deprecated: use app-export-kit. They go in the next major version.

## 7.8.0

- **A page can live inside Account:** an `extraPages` entry with `under: 'account'` is not a main-list row; it shows on the Account page under a new **Your data** heading (string `yourData`), with its `value` and `badge`, and Back from it returns to Account. Used by app-settings-kit to put Data Export inside Account.
- **Shortcuts between pages:** new `useSettingsNav()` for an app's own page inside the screen. `open(id)` opens another Settings page (Premium's Data Export perk opening Data Export); Back then returns to the page that opened it.
- `parentOf(page, accountPages?)` takes the ids of the pages under Account. `ExtraPage` is now exported.
- Nothing changes for an app that does not use `under` or `useSettingsNav`.

## 7.7.0

- **The app's own Back button:** new optional `components.BackButton` (`{ onPress, label }`). When passed, the kit draws it on every page (the main list and each inner page) where its own small arrow and word would be, so the app can use one Back everywhere. Without it nothing changes.
- **Swipe back from the left edge:** new optional `components.EdgeSwipe` (`{ onBack, children }`). When passed, the kit wraps the screen in it, and `onBack` steps back one page exactly like the Back button (from the main list it calls the app's `onBack`). The app owns the gesture; the kit only says where back goes.
- `KIT_VERSION` now reads 7.7.0 (it still said 7.5.0 in 7.6.0).

## 7.6.0

- **A value or badge on an added page's row:** `extraPages` entries take `value` (a short word on the right, read out with the label) and `badge` (drawn in its place, such as a plan pill). `SettingRow` takes `badge` too.

## 7.5.0

About is regrouped and gains Features and Version rows. **The layout changed for every app that upgrades; existing props keep working.**

- Three cards: Features, Rate, Share / Contact support, Privacy policy / Kits, Version.
- New `about.featuresUrl`: a Features row that opens the app's features web page (https only).
- The version is no longer under the app name. A Version row opens to show `about.version.lines` (one per line), or `label` when no lines are passed.
- `about.kits` also takes a list of `{ name, version, build? }`, shown one per line as "Name | vX | Build Y". New helpers `kitListLines` and `kitsMailLine`.
- `SettingRow` has a new `external` flag (slanted arrow for rows that open a web page). New strings `features`, `version`, `build`; optional `theme.tints.features`.

## 7.4.0

Sign out and Delete account share one row at the bottom of the main list. **The layout changed for every app that upgrades; nothing to change in code.**

- Sign out is an outlined button (a thin edge in the text color, no fill), on the left. Delete account keeps its red outline, on the right.
- Tapping Delete account opens the confirmation panel under Sign out, as before.
- `Button` has a new `variant="line"`.

## 7.3.0

Two new optional props on `SettingsScreen`:

- `hubOrder`: the order of the rows on the main list, for example `['app', 'account', 'data', 'about']`. Pages left out follow in the default order; pages the app does not have stay hidden. Without it the order is unchanged (Account, My data, App, About).
- `extraPages`: pages of the app's own, each a row on the main list with its own page and title (`{ id, label, icon, tint?, content }`), for example a Premium page. The kit knows nothing about what they hold. By default they sit just before About; put their `id` in `hubOrder` to place them.

To rename a row (and its page title) use the existing `strings` (`myData`, `app`). Nothing to change when upgrading from 7.2.

```tsx
<SettingsScreen
  strings={{ app: 'Preferences', myData: 'Backup and export' }}
  extraPages={[{ id: 'premium', label: 'Premium', icon: 'award', content: <PremiumRows /> }]}
  hubOrder={['app', 'premium', 'account', 'data', 'about']}
  …
/>
```

## 7.2.0

- A tall `brand` (such as a logo with text 64 px high) is no longer cut off: the brand sets the height of the top row, and Back is pinned to the left, centred on it.
- New optional theme value `backSize`: the size of the word Back, to match the app's own Back buttons (it is then bold). Without it Back stays 14 px. Nothing to change when upgrading from 7.1.

## 7.1.0

New optional `brand` prop on `SettingsScreen`: the app's logo and name. With it, the top row of every page is a small Back on the left and the brand centred, and the page title sits under that row on the left (30 px on the first page, 24 px on the others). About keeps its own big picture and shows no brand row. Without `brand`, the pages look as in 7.0.2. Nothing to change when upgrading from 7.0.

```tsx
<SettingsScreen brand={<MyLogoAndName />} … />
```

## 7.0.2

The back arrow now says "Back" beside it (a green chevron and the `back` string, no circle), so it reads as a button. Nothing to change when upgrading from 7.0.

## 7.0.1

About no longer reserves an empty header row: the arrow floats at the top-left and the logo starts level with it. Nothing to change when upgrading from 7.0.

## 7.0.0

The kit draws the page header (centred 20 px titles); Delete account is an outlined red button with a trash icon. See "Upgrading from 6.x to 7.0".

## 6.1.0

`PickerRow` and `ChoiceSheet` now accept numbers as option values (`value: 15`, `onChange(15)`), and `PickerRow` takes an optional `detail` line under its label. Nothing to change when upgrading from 6.0.


# Upgrade guides

## Upgrading from 6.x to 7.0

- **The kit now draws the page header.** Remove `Header` from your `components` (TypeScript flags it). The first page keeps a big left title under the arrow; Account, My data, App and Change password show a smaller (20) title centred beside the arrow, with space below. The arrow is a round button in `theme.field` and `theme.border`, with the chevron in `theme.accent`.
- **Delete account is a button**: the same size as Sign out, red outline and red text, with a trash icon. Its confirm step is unchanged. `Button` has a new `variant="outline"` (it replaces the unused `link`).

## Upgrading from 5.0 to 6.0

What people see:
- **Delete account** moved from the Account page to the main list, right under Sign out, as quiet red text. Same confirmation as before.
- **Account** shows the email as its own read-only row under the nickname (small label, address below), no longer under the name.
- **About** has no page title. It shows the app's picture, its name in the app's own color and the version small below. The Version row is gone. Order: Contact support, Share, Rate, Privacy policy, Kits. Contact support and Kits open in place (the arrow turns down); every other row has an arrow too.
- **Share** and **Rate** are named just that, and show whenever you pass `about.share` and `about.rate`. Until the App Store link and number are set, a tap says "Available once the app is on the App Store." (`strings.notOnStoreYet`).

What to change in your app (TypeScript points at each one):
- Theme: two new values, `brand` (the app's name on About, your own color) and `scrim` (dims the screen behind a picker sheet, such as `rgba(0,0,0,0.6)`). `themeContrast` now checks `brand` against the page and `on` against the sheet.
- `data`: `{ label, value, onDownload }` becomes `{ label, formats: [{ id: 'csv', label: 'CSV', onDownload }] }`. With one format a tap downloads; add a second (such as PDF) and the same row opens a sheet from the bottom to choose.
- `about.logo`: optional, the app's picture (`require('./assets/icon.png')`).
- Wording: `strings.share` and `strings.rate` are plain text, not functions of the app name; `strings.version` is gone; new: `email`, `supportHint`, `notOnStoreYet`, `close`.
- A custom `components.Header` must cope with a missing `title` (About has none). *(Removed in 7.0: see above.)*
- `SettingRow` takes `expanded` (arrow turns down, screen readers hear it). It no longer says "expanded" just because it has children.

New pieces for your own settings pages:
- `PickerRow`: a row with the current choice on the right and an arrow; a tap slides a `ChoiceSheet` up from the bottom. `<PickerRow icon label tint options={[{ value, label, detail? }]} value onChange />`.
- `ExpandRow`: a row that opens its content right below it.
- Also exported: `ChoiceSheet`, `kitLines`.

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


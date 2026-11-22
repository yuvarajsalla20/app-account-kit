# Changelog

Release notes for app-account-kit, newest first. Each version is tagged in git (`v7.12.0`). Upgrade guides for the major versions follow the release notes.

## 7.34.0 (2026-11-22)

- **The Premium tag.** `SettingRow` takes `premium`: a small solid gold tag, the award mark and the word "PREMIUM" in `ink`, sits right after the row's name for every account, free and paid, so the person always knows which features the plan includes. Screen readers hear "Premium" after the name (`strings.premiumTag`). A `locked` premium row shows its padlock in the same gold. `PremiumTag`, `PremiumLock` and `premiumGold` are exported for an app's own rows.
- **One Premium gold.** `theme.premium` (optional) colors the tag and the padlock. By default it is `tints.rate`, the gold of the plan page's Free and Premium comparison.
- **Locked Premium pages.** `ExtraPage` takes `premium`, `locked` and `onLocked`. A locked row shows only the gold padlock on the right (no value, badge or menu), and a tap calls `onLocked` (open the plans), or opens the page when there is none.

## 7.33.0 (2026-11-21)

- **Paid options in pull-down pickers.** `PickerRow` takes `onPick` (called on every pick, e.g., to play the sound just picked), `locked(value)` and `onLocked(value)` (a padlock on each paid option, which is not kept when picked; the paid options start their own group) and `note` (a line at the top of the menu, or under the options in the sheet). An option can take `lead`, an icon before its label. An app no longer needs its own sheet for a picker with paid options, such as Default Sound or Repeat Alerts.
- **Fix: `KIT_VERSION` reads 7.33.0.** 7.32.0 still reported 7.31.0 in the kits line.

## 7.32.0 (2026-11-21)

- **Fix: the Profile photo is no longer cut off at the top.** 7.27.1 pulled the centred photo up with a negative top margin, and the page's scroll view hid the part drawn above its top edge, so the top of the circle was cut off flat on iPhone and Android. The photo now starts at the top of the page content, uncut.
- **Glass pull-down menus.** `PullDownMenu` (and every picker, `MenuRow` and Home menu built on it) now opens over the row that opened it, as iOS does: it covers the row and grows upward, or grows downward from the row's top when there is no room above. The card is more rounded (28 pt), has a thin outline (`theme.menuEdge`, default `text` at 55%) and no lines between choices; the chosen line is a little bolder. `components.MenuBackdrop` draws behind it, so an app can pass its frosted blur and a see-through `theme.menu` for a glass look. A long list now uses the height of the screen and scrolls.
- **Richer menu lines.** `PullDownItem` takes `lead` (an icon before the label), `dot` (a color dot), `locked` (a padlock in the theme's lock colors; screen readers hear the locked hint) and `group` (a thin line and a little space above, to start a new group).

## 7.31.0 (2026-11-21)

- **Professional default words.** The locked-row hint screen readers hear is now "Available with Premium" (was "Needs the paid plan"), the nickname placeholder "Add a Nickname", the Support title "How Can We Help?" and the Share message "Discover <App>: <link>". An app that passed its own words still wins where the settings kit allows it.

## 7.30.0 (2026-11-21)

- **About can show the logo on its own.** `about.showHeader: 'logo'` keeps the page title "About" in the header and shows the app's logo under it at 104 pt, with the home screen's rounded corners and a soft shadow, without the app name. A drawn element logo shows as it is. Without a logo nothing is drawn at the top. `true` and `false` work as before.

## 7.29.0 (2026-11-21)

- **Fix: Data Export opens the share sheet on iPhone.** A pick from a pull-down menu (`PullDownMenu`, `MenuRow`, pull-down `PickerRow`) or a sheet (`DataRow`, sheet `PickerRow`) ran while its Modal was still fading out, and iPhone often does not show a share sheet asked for then. The pick now runs once the Modal has closed (its `onDismiss`, with a short fallback). `PullDownMenu` takes `visible` and `useAnchor` returns `opened`: an app that draws its own menu should keep it mounted with `{opened ? <PullDownMenu visible={open} … /> : null}`; one that removes it on close still works, a moment later. `ChoiceSheet` takes `onDismiss`.
- **Fix: My data download is patient.** It ends in the share sheet, which waits for the person, so it is no longer reported as "taking too long" after 45 s.
- **Fix: the Delete account steps stay fixed once the page opens.** If the app stopped passing `exitMenu.unlock` part way, the type-DELETE step could be skipped and the bar read "Step 0 of 2". Now the unlock step moves on to "what you will lose", never past typing DELETE, and the bar keeps its count. An `unlock` passed only after the page opened is not added part way.
- **Fix: the kit's ⋯ list on Account floats above the page.** Without `components.Menu` it was drawn inside the header, so on iPhone the first cards covered it. It is now the same pull-down menu as the pickers, in a Modal under the ⋯.
- **Reserved page ids, checked.** `RESERVED_PAGE_IDS` (new export, with `isReservedPageId`) lists every kit page: `hub`, `account`, `data`, `app`, `about`, `password`, `support`, `signOut`, `deleteAccount`, `access`. The `ExtraPage.id` doc named only six. An extra page with one of these ids drew on top of the kit's own page; it is now left out and reported through `onError('extraPages', …)`, with a console warning in development.
- **Share and Rate show only when they go somewhere.** Share needs an https `share.url`; Rate on iPhone needs a real `rate.appStoreId` (digits). An empty object, an empty or missing value no longer shows a row that only says "not on the store yet". Apps can always pass their store constants. `strings.notOnStoreYet` is no longer shown.
- **Photo limit 80,000.** `DEFAULT_PHOTO_MAX_CHARS` drops from 400,000 to 80,000, the limit in both apps' Firestore rules, so a photo the kit accepts is not refused by the server.
- **Photo picker in the kit (opt-in):** `app-account-kit/photo` exports `pickProfilePhoto` and `cameraSupported`, the picker both apps copied into `src/shared/photo.ts`. Square, 256 px, JPEG under the limit (it saves at lower quality if needed), throws `permission` when the camera is refused. Needs `expo-image-picker` and `expo-image-manipulator` (optional peers; only this entry loads them).
- **`initialOf` for avatars outside Settings.** Call `initialOf(nickname, email)` for the Home avatar so it shows the same letter as Settings. It keeps a whole emoji where the platform can tell (`Intl.Segmenter`).
- **Still deprecated: `CSV_BOM`, `toCsv`, `csvFileName`** (since 7.9.0). They stay in 7.29.0 so no app breaks in a minor release, and go away in 8.0.0. Use app-export-kit; neither app imports them from this kit.

## 7.28.0 (2026-11-21)

**Profile, not Account.** The Account row and page are called **Profile** by default (`strings.account`), and the Log Out lines no longer say "safe in your account". Only the delete steps still say "account", because the account is really deleted. Reword through `strings.account` as before.

## 7.27.1

- **Fix:** with `exitMenu.signOutMenu`, the Delete account group row showed the same `log-out` icon as the Sign out row above it, so it looked like a second Sign out. It now shows `user-x`, as 7.25.0 describes. Nothing to change in apps.
- **Tighter centred photo:** with `profile.centered`, the photo sits closer to the page title above it and to the first card below it (12 pt less above, 6 pt less below).

## 7.27.0

- **Rate on Android (opt-in):** `rate.playPackage` (the app's Google Play package name, such as `com.example.app`) shows the Rate row on Android too. It opens the app's Play Store page (`market://details?id=…`), and the web page on play.google.com if the Play Store app cannot be opened. New string `openPlayStore`. Without `playPackage`, Rate stays hidden on Android as before, and iPhone is unchanged.

## 7.26.0

- **Pull-down pickers (opt-in):** `pickers="pullDown"` on `SettingsScreen` (or `AccountProvider`) draws every `PickerRow` as a grey value pill with a small up/down chevron. A tap floats an iOS-style menu right under the row (above it near the bottom of the screen), with a tick on the chosen line, instead of a sheet from the bottom. A row can override with `style`. `Choice` takes `icon` and `pill` (a shorter word for the pill). `theme.menu` sets the menu fill (default `surface`). New exports: `MenuRow`, `PullDownMenu`, `PullDownPill`, `UpDown`, `useAnchor`, `placeMenu`.
- **Menu rows for app pages:** an `ExtraPage` with `menu: { pill, head, items, onPick }` opens a pull-down menu in place instead of a page (Data Export with one tap).
- **Sign out as a menu (opt-in):** with `signOutOnAccount`, `exitMenu.signOutMenu: true` makes the Sign out row open a small menu (`signOutBody`, a red Sign out, Stay) instead of its confirm page.
- **Delete steps on the group page (opt-in):** with `signOutOnAccount`, `exitMenu.deleteOnAccess: true` shows the Delete account steps on the group page itself (no single row in between). Keep my account returns to Account.
- **Card headings (opt-in):** new strings `profileGroup`, `dataGroup`, `exitGroup` (Account) and `aboutAppGroup`, `aboutHelpGroup`, `aboutInfoGroup` (About) draw grey headings over those cards. Empty by default, so nothing changes. With `aboutInfoGroup`, Version comes before Kits.

## 7.25.0

- **Sign out on Account, Delete account on its own page (opt-in):** with `exitMenu.place: 'page'`, `exitMenu.signOutOnAccount: true` makes Sign out its own row on Account, in the same card just above the group row. The group page then holds only Delete account, and the group row gets a `user-x` icon. Name the group through `strings.access` (an app might say "Deactivate"). Back and "Stay signed in" from Sign out return to Account. Nothing changes for apps that leave it out.

## 7.24.0

- **Access page for Sign out and Delete account (opt-in):** `exitMenu.place: 'page'` drops the ⋯ on Account. Account gets one row at the bottom, **Access** (`strings.access`), that opens its own page with a Sign out row and a red Delete account row, and a short line under them (`strings.accessNote`). Each row opens the same Sign out and Delete account pages as before, with every step kept; Back and "Stay signed in" return to Access. `SettingRow` takes `danger` for a red label. `place: 'menu'` (the default) keeps the ⋯, so nothing changes for apps that leave it out.

## 7.23.0

- **Avatar in the app's own look (opt-in):** `Avatar` takes `style` (added to the circle, photo and initial alike) and `initialStyle` (added to the initial's text). An app can draw the same avatar outside Settings, inside `AccountProvider`, with its own fill, edge and type. Nothing changes for apps that leave them out.

## 7.22.0

- **Centred profile photo (opt-in):** `profile.centered: true` puts a bigger photo (96 pt) in the middle of Account, with a small round pencil (Feather `edit-2`, in `accent`) on its corner in place of the "Change photo" link. Tapping the photo or pencil opens the same Take photo / Choose / Remove choices. The name is not shown beside it; the nickname stays in its field. Nothing changes for apps that leave it out.

## 7.21.0

- **Drawn logo on About (opt-in):** `about.logo` can now be a React element as well as an image source. An element is drawn as it is, at its own size, above the app name, so a logo that is not square or has a glow shows in full. An image source keeps the 84 pt rounded square. Nothing changes for apps that pass an image.

## 7.20.0

- **Plain headers on every page (opt-in):** `plainHeaders` on `SettingsScreen` gives every page, the main list included, the 7.19.0 plain header: no `brand`, and the page title in the top row on the left beside Back. About keeps its own picture as the header. Nothing changes for apps that leave it out.

## 7.19.0

- **Plain header for one page (opt-in):** an `extraPages` entry can set `plainHeader: true`. That page leaves out `brand` and shows Back and the page title in one row, the title on the left beside Back (20 pt, bold), with no logo row and no title line under it. Every other page keeps the brand. Nothing changes for apps that leave it out.

## 7.18.0

- **Contact Support looks like the other pages.** The big centred hero (26 pt title, round mail picture, full-width button) is gone. The page title stays in the header; under it a left-aligned heading (16 pt, like a row label) and line (15 pt), one "Write to Us" row in a card (the `support` tint), and the small note under the card. Same words, same email, same behaviour; nothing to change in apps. Every app that updates sees the new layout.

## 7.17.0

- **Sign out and Delete account behind a ⋯ menu (opt-in):** new optional `exitMenu` prop. When passed, the two buttons leave the main list; Account gets a round ⋯ at the top right with Sign out and Delete account, each opening its own page (`signOut`, `deleteAccount`, Back returns to Account).
  - Sign out page: one button and "Stay signed in".
  - Delete account page, in steps: (1) `exitMenu.unlock(onUnlocked)`, the app's own unlock such as Face ID or a PIN, only when the app passes it; (2) what will be lost (`exitMenu.losses` and `deleteWarning`) with a "Just want a break? Sign out instead" link and a box where the person types DELETE; (3) the password (or Apple / Google inside `onDeleteAccount`) before anything is erased.
  - `components.Menu` (optional) draws the ⋯ menu in the app's style; default is the kit's round button and a small list.
  - New strings: `moreOptions`, `signOutTitle`, `signOutBody`, `stayIn`, `deleteLoseTitle`, `deleteBreakTitle`, `deleteBreakAction`, `deleteTypeWord`, `deleteTypeLabel`, `continue`, `deleteFinalTitle`, `deleteFinalPassword`, `deleteFinalProvider`, `deleteForever`, `stepOf`. An app that builds a whole `AccountStrings` object must add them.
- **Top slot (opt-in):** new optional `top` (a node, or a function of the page) drawn at the top of the main list, and with `topOnEveryPage` on every page. For an app's logo, name and tagline.
- `PageHeader` takes an optional `right` node. New helper `typedWordMatches`.
- Nothing changes for apps that leave these out.

## 7.16.1

- **Fix:** with `about.showHeader: false`, About now keeps the normal page header (the app's brand row and the title "About"), like every other Settings page. Before, the page had no header at all and Back sat on top of the first row. Default About is unchanged.

## 7.16.0

- **About without the top name (opt-in):** new optional `about.showHeader` (default true). Pass false to leave out the app's logo and name at the top of About, for apps that already show their brand on the page (for example in `footer`). Nothing changes for apps that leave it out.

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


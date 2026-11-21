import { useEffect, useMemo, useRef, useState, type ElementRef } from 'react';
import { AccessibilityInfo, BackHandler, Keyboard, Platform, ScrollView, View } from 'react-native';
import { AccountProvider, type AccountComponents } from './context';
import { useLook, useStyles, type PickerStyle } from './look';
import { useAction } from './hooks/useAction';
import { RESERVED_PAGE_IDS, parentOf, usableExtraPages, type Page } from './logic/pages';
import { SettingsNavContext, type SettingsNav } from './nav';
import { AboutSection } from './sections/AboutSection';
import { AccountPage } from './sections/AccountPage';
import { AppPage } from './sections/AppPage';
import { HubPage } from './sections/HubPage';
import { AccessPage, DeleteAccountPage, ExitMenuButton, SignOutPage } from './sections/ExitPages';
import { DataRow } from './sections/profile/DataRow';
import { PasswordPage } from './sections/profile/PasswordPage';
import { SupportPage } from './sections/SupportPage';
import type { AccountStrings } from './strings';
import type { AccountTheme } from './theme';
import type { SettingsScreenProps } from './types';
import { SettingsGroup, STACK } from './ui/Group';
import { PageHeader } from './ui/Header';

type Props = SettingsScreenProps & {
  /** Every color and size, from the app. The kit has no look of its own. */
  theme: AccountTheme;
  strings?: Partial<AccountStrings>;
  components?: Partial<AccountComponents>;
  /** 7.26.0: 'pullDown' draws every value row (PickerRow, here and on the app's own pages) as a grey pill with a pull-down menu. Default 'sheet'. */
  pickers?: PickerStyle;
};

const BUILTIN = new Set<string>(RESERVED_PAGE_IDS);

function Body({ onBack, backLabel, brand, plainHeaders, footer, footerOnEveryPage, top, topOnEveryPage, exitMenu, profile, nickname, photo, password, data, app, hubOrder, extraPages: givenPages, about, actions, actionTimeoutMs, onError, describeError }: SettingsScreenProps) {
  const { strings, components } = useLook();
  const styles = useStyles((t) => ({ body: { ...STACK, paddingBottom: 40 }, note: { color: t.danger, fontSize: 13, lineHeight: 18 }, good: { color: t.accent }, footer: { alignItems: 'center', marginTop: 16 }, top: { alignItems: 'center' } }));
  const action = useAction(onError, describeError, actionTimeoutMs, strings.tookTooLong);
  // 7.29.0: an app page named like one of the kit's own pages would draw both at once, so it is left out and reported.
  const { pages: extraPages, clashes } = useMemo(() => usableExtraPages(givenPages), [givenPages]);
  const clashKey = clashes.join(',');
  useEffect(() => {
    if (!clashKey) return;
    const error = new Error(`extraPages: ${clashKey} ${clashes.length > 1 ? 'are' : 'is'} the kit's own page name; that page is left out. Pick another id.`);
    onError?.('extraPages', error);
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`[app-account-kit] ${error.message}`);
  }, [clashKey]);
  const scroll = useRef<ElementRef<typeof ScrollView>>(null);
  const [asked, setPage] = useState<Page>('hub');
  // Set when an app's page opened another one through useSettingsNav: Back returns there instead of the usual parent.
  const [returnTo, setReturnTo] = useState<Page | null>(null);
  const accountPages = useMemo(() => (extraPages ?? []).filter((p) => p.under === 'account').map((p) => p.id), [extraPages]);
  const appRows = useMemo(() => (extraPages ?? []).filter((p) => p.under === 'app'), [extraPages]);
  const appPages = useMemo(() => appRows.map((p) => p.id), [appRows]);
  // The App page shows when the app has settings of its own or a page that lives there.
  const hasApp = !!app || appRows.length > 0;
  // If what a page shows goes away while it is open (the app stopped passing it), fall back to the list instead of a blank page.
  // 7.24.0 exitMenu.place 'page': no ⋯; an Access row on Account opens a page with both actions, and Back from them returns there.
  const exitOnPage = !!exitMenu && exitMenu.place === 'page' && !!(actions.onSignOut || actions.onDeleteAccount);
  // 7.25.0 signOutOnAccount: Sign out is its own row on Account; the group page holds only Delete account.
  const signOutOnAccount = exitOnPage && !!exitMenu?.signOutOnAccount && !!actions.onSignOut;
  // 7.26.0 signOutMenu: that row opens a small menu (Sign out / Stay) instead of the confirm page.
  const signOutMenu = signOutOnAccount && !!exitMenu?.signOutMenu;
  // 7.26.0 deleteOnAccess: the group page shows the Delete account steps itself, not one row that opens them.
  const deleteOnAccess = signOutOnAccount && !!exitMenu?.deleteOnAccess && !!actions.onDeleteAccount;
  const hasAccess = exitOnPage && !!(actions.onDeleteAccount || (actions.onSignOut && !signOutOnAccount));
  const exitHome: Page = hasAccess ? 'access' : 'account';
  const signOutHome: Page = signOutOnAccount ? 'account' : exitHome;
  const missing = (asked === 'access' && !hasAccess) || (asked === 'password' && !password) || (asked === 'data' && !data) || (asked === 'app' && !hasApp) || (asked === 'signOut' && !(exitMenu && actions.onSignOut)) || (asked === 'deleteAccount' && !(exitMenu && actions.onDeleteAccount)) || (!BUILTIN.has(asked) && !extraPages?.some((p) => p.id === asked));
  const page: Page = missing ? 'hub' : asked;
  const go = (next: Page) => {
    action.setNote(null);
    setReturnTo(null);
    setPage(next);
  };
  const latest = useRef({ go, page: 'hub' as Page });
  /** Returns true when it handled Back inside the screen; false from the list, where the app takes over. */
  const stepBack = (): boolean => {
    if (action.busy) return true; // a save or delete is running: stay, so its result lands on the page that started it
    Keyboard.dismiss(); // leaving a text box saves what was typed in it
    const up = returnTo ?? (page === 'signOut' && exitOnPage ? signOutHome : parentOf(page, accountPages, appPages, hasAccess));
    if (!up) return false;
    go(up);
    return true;
  };
  const back = () => {
    if (!stepBack()) onBack();
  };
  // Android's Back button: the same steps as the arrow. Registered after the app's own, so it is asked first.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', stepBack);
    return () => sub.remove();
  });
  // A new message may land while the button that caused it is far down the page: bring it into view and say it aloud on iOS (Android announces it through the live region).
  useEffect(() => {
    if (!action.note) return;
    scroll.current?.scrollTo({ y: 0, animated: true });
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(action.note);
  }, [action.noteKey]);
  latest.current = { go, page };
  const nav = useMemo<SettingsNav>(
    () => ({
      open: (next) => {
        const from = latest.current.page;
        latest.current.go(next);
        if (next !== from) setReturnTo(from);
      },
    }),
    [],
  );
  const extra = extraPages?.find((p) => p.id === page);
  // 7.20.0 plainHeaders: every page gets the plain header that 7.19.0 gave one added page.
  const plain = !!(plainHeaders || extra?.plainHeader);
  const titles: Record<string, string> = { hub: strings.settings, account: strings.account, data: strings.myData, app: strings.app, password: strings.changePassword, support: strings.contactSupport, signOut: strings.signOut, deleteAccount: strings.deleteAccount, access: strings.access };
  // 7.17.0 exitMenu: Sign out and Delete account behind a ⋯ on Account instead of on the main list.
  const exitItems = exitMenu && !exitOnPage
    ? [
        ...(actions.onSignOut ? [{ id: 'signOut', label: strings.signOut, icon: 'log-out' }] : []),
        ...(actions.onDeleteAccount ? [{ id: 'deleteAccount', label: strings.deleteAccount, icon: 'trash-2', danger: true }] : []),
      ]
    : [];
  const right = page === 'account' && exitItems.length ? <ExitMenuButton items={exitItems} onPick={(id) => go(id)} /> : null;
  const topNode = top && (page === 'hub' || topOnEveryPage) ? (typeof top === 'function' ? top(page) : top) : null;
  const note = action.note ? <components.Text style={[styles.note, action.noteGood && styles.good]} accessibilityLiveRegion="polite">{action.note}</components.Text> : null;

  const body = (
    <>
      <PageHeader large={page === 'hub'} title={page === 'about' ? (about.showHeader === false ? strings.about : undefined) : (extra?.label ?? titles[page])} onBack={back} backLabel={page === 'hub' ? (backLabel ?? strings.back) : strings.back} brand={plain ? undefined : brand} inline={plain} right={right} />
      <ScrollView ref={scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={styles.body}>
        {topNode ? <View style={styles.top}>{topNode}</View> : null}
        {note}
        {page === 'hub' ? <HubPage data={data} app={app} hasApp={hasApp} hubOrder={hubOrder} extraPages={extraPages} onSignOut={exitMenu ? undefined : actions.onSignOut} onDeleteAccount={exitMenu ? undefined : actions.onDeleteAccount} confirmsWithPassword={actions.confirmsWithPassword} action={action} onOpen={go} onReveal={() => scroll.current?.scrollToEnd({ animated: true })} /> : null}
        {page === 'hub' && footer ? <View style={styles.footer}>{footer}</View> : null}
        {page === 'account' ? (
          <AccountPage profile={profile} nickname={nickname} photo={photo} password={password} action={action} onOpenPassword={() => go('password')} dataPages={extraPages?.filter((p) => p.under === 'account')} onOpen={go} onOpenAccess={hasAccess ? () => go('access') : undefined} onOpenSignOut={signOutOnAccount && !signOutMenu ? () => go('signOut') : undefined} onSignOutNow={signOutMenu && actions.onSignOut ? () => action.run('sign-out', actions.onSignOut!, () => strings.couldNot(strings.signOutAction)) : undefined} />
        ) : null}
        {page === 'access' && hasAccess && deleteOnAccess && exitMenu && actions.onDeleteAccount ? (
          <DeleteAccountPage onDeleteAccount={actions.onDeleteAccount} confirmsWithPassword={actions.confirmsWithPassword} exit={exitMenu} action={action} onSignOutInstead={actions.onSignOut ? () => go('signOut') : undefined} onCancel={() => go('account')} />
        ) : null}
        {page === 'access' && hasAccess && !deleteOnAccess ? <AccessPage onSignOut={actions.onSignOut && !signOutOnAccount ? () => go('signOut') : undefined} onDeleteAccount={actions.onDeleteAccount ? () => go('deleteAccount') : undefined} /> : null}
        {page === 'signOut' && exitMenu && actions.onSignOut ? <SignOutPage onSignOut={actions.onSignOut} action={action} onStay={() => go(signOutHome)} /> : null}
        {page === 'deleteAccount' && exitMenu && actions.onDeleteAccount ? (
          <DeleteAccountPage onDeleteAccount={actions.onDeleteAccount} confirmsWithPassword={actions.confirmsWithPassword} exit={exitMenu} action={action} onSignOutInstead={actions.onSignOut ? () => go('signOut') : undefined} onCancel={() => go(exitHome)} />
        ) : null}
        {page === 'password' && password ? <PasswordPage {...password} action={action} onDone={() => go('account')} /> : null}
        {page === 'data' && data ? <SettingsGroup><DataRow {...data} action={action} /></SettingsGroup> : null}
        {extra ? <View style={STACK}>{extra.content}</View> : null}
        {page === 'app' && hasApp ? <AppPage content={app?.content} pages={appRows} onOpen={go} /> : null}
        {page === 'about' ? <AboutSection {...about} action={action} onOpenSupport={() => go('support')} /> : null}
        {page === 'support' ? <SupportPage appName={about.appName} version={about.version} supportEmail={about.supportEmail} kits={about.kits} action={action} /> : null}
        {page !== 'hub' && footerOnEveryPage && footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </>
  );
  // A swipe from the left edge, when the app passes one, takes the same step as the Back button.
  const screen = components.EdgeSwipe ? <components.EdgeSwipe onBack={back}>{body}</components.EdgeSwipe> : body;
  return <SettingsNavContext.Provider value={nav}>{screen}</SettingsNavContext.Provider>;
}

/**
 * The Settings screen: a main list (Account, My data, App, About and the app's own pages, then Sign out) and a page behind each row.
 * An app page with `under: 'account'` is a row on Account, and one with `under: 'app'` a row on the App page (Preferences), instead of on the main list.
 * The app draws its own page background around it; the kit draws the headers and cards through the theme and `components`.
 */
export function SettingsScreen({ theme, strings, components, pickers, ...props }: Props) {
  return (
    <AccountProvider theme={theme} strings={strings} components={components} pickers={pickers}>
      <Body {...props} />
    </AccountProvider>
  );
}

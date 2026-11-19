import { useEffect, useMemo, useRef, useState, type ElementRef } from 'react';
import { AccessibilityInfo, BackHandler, Keyboard, Platform, ScrollView, View } from 'react-native';
import { AccountProvider, type AccountComponents } from './context';
import { useLook, useStyles } from './look';
import { useAction } from './hooks/useAction';
import { parentOf, type Page } from './logic/pages';
import { SettingsNavContext, type SettingsNav } from './nav';
import { AboutSection } from './sections/AboutSection';
import { AccountPage } from './sections/AccountPage';
import { AppPage } from './sections/AppPage';
import { HubPage } from './sections/HubPage';
import { DeleteAccountPage, ExitMenuButton, SignOutPage } from './sections/ExitPages';
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
};

const BUILTIN = new Set<string>(['hub', 'account', 'data', 'app', 'about', 'password', 'support', 'signOut', 'deleteAccount']);

function Body({ onBack, backLabel, brand, footer, footerOnEveryPage, top, topOnEveryPage, exitMenu, profile, nickname, photo, password, data, app, hubOrder, extraPages, about, actions, actionTimeoutMs, onError, describeError }: SettingsScreenProps) {
  const { strings, components } = useLook();
  const styles = useStyles((t) => ({ body: { ...STACK, paddingBottom: 40 }, note: { color: t.danger, fontSize: 13, lineHeight: 18 }, good: { color: t.accent }, footer: { alignItems: 'center', marginTop: 16 }, top: { alignItems: 'center' } }));
  const action = useAction(onError, describeError, actionTimeoutMs, strings.tookTooLong);
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
  const missing = (asked === 'password' && !password) || (asked === 'data' && !data) || (asked === 'app' && !hasApp) || (asked === 'signOut' && !(exitMenu && actions.onSignOut)) || (asked === 'deleteAccount' && !(exitMenu && actions.onDeleteAccount)) || (!BUILTIN.has(asked) && !extraPages?.some((p) => p.id === asked));
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
    const up = returnTo ?? parentOf(page, accountPages, appPages);
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
  const titles: Record<string, string> = { hub: strings.settings, account: strings.account, data: strings.myData, app: strings.app, password: strings.changePassword, support: strings.contactSupport, signOut: strings.signOut, deleteAccount: strings.deleteAccount };
  // 7.17.0 exitMenu: Sign out and Delete account behind a ⋯ on Account instead of on the main list.
  const exitItems = exitMenu
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
      <PageHeader large={page === 'hub'} title={page === 'about' ? (about.showHeader === false ? strings.about : undefined) : (extra?.label ?? titles[page])} onBack={back} backLabel={page === 'hub' ? (backLabel ?? strings.back) : strings.back} brand={extra?.plainHeader ? undefined : brand} inline={!!extra?.plainHeader} right={right} />
      <ScrollView ref={scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={styles.body}>
        {topNode ? <View style={styles.top}>{topNode}</View> : null}
        {note}
        {page === 'hub' ? <HubPage data={data} app={app} hasApp={hasApp} hubOrder={hubOrder} extraPages={extraPages} onSignOut={exitMenu ? undefined : actions.onSignOut} onDeleteAccount={exitMenu ? undefined : actions.onDeleteAccount} confirmsWithPassword={actions.confirmsWithPassword} action={action} onOpen={go} onReveal={() => scroll.current?.scrollToEnd({ animated: true })} /> : null}
        {page === 'hub' && footer ? <View style={styles.footer}>{footer}</View> : null}
        {page === 'account' ? (
          <AccountPage profile={profile} nickname={nickname} photo={photo} password={password} action={action} onOpenPassword={() => go('password')} dataPages={extraPages?.filter((p) => p.under === 'account')} onOpen={go} />
        ) : null}
        {page === 'signOut' && exitMenu && actions.onSignOut ? <SignOutPage onSignOut={actions.onSignOut} action={action} onStay={() => go('account')} /> : null}
        {page === 'deleteAccount' && exitMenu && actions.onDeleteAccount ? (
          <DeleteAccountPage onDeleteAccount={actions.onDeleteAccount} confirmsWithPassword={actions.confirmsWithPassword} exit={exitMenu} action={action} onSignOutInstead={actions.onSignOut ? () => go('signOut') : undefined} onCancel={() => go('account')} />
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
export function SettingsScreen({ theme, strings, components, ...props }: Props) {
  return (
    <AccountProvider theme={theme} strings={strings} components={components}>
      <Body {...props} />
    </AccountProvider>
  );
}

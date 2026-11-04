import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AccountProvider, useLook, useStyles, type AccountComponents } from './context';
import { useAction } from './hooks/useAction';
import { parentOf, type Page } from './logic/pages';
import { AboutSection } from './sections/AboutSection';
import { AccountPage } from './sections/AccountPage';
import { HubPage } from './sections/HubPage';
import { DataRow } from './sections/profile/DataRow';
import { PasswordPage } from './sections/profile/PasswordPage';
import type { AccountStrings } from './strings';
import type { AccountTheme } from './theme';
import type { SettingsScreenProps } from './types';
import { SettingsGroup } from './ui/Group';

type Props = SettingsScreenProps & {
  /** Every color and size, from the app. The kit has no look of its own. */
  theme: AccountTheme;
  strings?: Partial<AccountStrings>;
  components?: Partial<AccountComponents>;
};

function Body({ onBack, backLabel, profile, nickname, photo, password, data, app, about, actions, onError, describeError }: SettingsScreenProps) {
  const { strings, components } = useLook();
  const styles = useStyles((t) => ({ body: { gap: 16, paddingBottom: 40 }, note: { color: t.accent, fontSize: 13, lineHeight: 18 } }));
  const action = useAction(onError, describeError);
  const [page, setPage] = useState<Page>('hub');
  const go = (next: Page) => {
    action.setNote(null);
    setPage(next);
  };
  const back = () => {
    const up = parentOf(page);
    if (up) go(up);
    else onBack();
  };
  const titles: Record<Page, string> = { hub: strings.settings, account: strings.account, data: strings.myData, app: strings.app, about: strings.about, password: strings.changePassword };
  const note = action.note ? <components.Text style={styles.note} accessibilityLiveRegion="polite">{action.note}</components.Text> : null;

  return (
    <>
      <components.Header title={titles[page]} onBack={back} backLabel={page === 'hub' ? (backLabel ?? strings.back) : strings.back} />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
        {note}
        {page === 'hub' ? <HubPage profile={profile} data={data} app={app} about={about} onSignOut={actions.onSignOut} onOpen={go} /> : null}
        {page === 'account' ? (
          <AccountPage profile={profile} nickname={nickname} photo={photo} password={password} action={action} onOpenPassword={() => go('password')} onDeleteAccount={actions.onDeleteAccount} confirmsWithPassword={actions.confirmsWithPassword} />
        ) : null}
        {page === 'password' && password ? <PasswordPage {...password} action={action} onDone={() => go('account')} /> : null}
        {page === 'data' && data ? <SettingsGroup><DataRow {...data} action={action} /></SettingsGroup> : null}
        {page === 'app' && app ? <View style={{ gap: 16 }}>{app.content}</View> : null}
        {page === 'about' ? <AboutSection {...about} action={action} /> : null}
      </ScrollView>
    </>
  );
}

/**
 * The Settings screen: a main list (Account, My data, App, About, then Sign out) and a page behind each row.
 * The app draws its own page background around it; the kit draws the headers and cards through the theme and `components`.
 */
export function SettingsScreen({ theme, strings, components, ...props }: Props) {
  return (
    <AccountProvider theme={theme} strings={strings} components={components}>
      <Body {...props} />
    </AccountProvider>
  );
}

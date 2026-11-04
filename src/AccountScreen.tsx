import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AccountProvider, useLook, useStyles, type AccountComponents } from './context';
import { useAction } from './hooks/useAction';
import { ActionsSection } from './sections/ActionsSection';
import { AboutSection } from './sections/AboutSection';
import { PasswordPage } from './sections/profile/PasswordPage';
import { ProfileSection } from './sections/ProfileSection';
import type { AccountStrings } from './strings';
import type { AccountTheme } from './theme';
import type { AccountScreenProps } from './types';
import { Page } from './ui/Page';

type Props = AccountScreenProps & {
  /** Every color and size, from the app. The kit has no look of its own. */
  theme: AccountTheme;
  strings?: Partial<AccountStrings>;
  components?: Partial<AccountComponents>;
};

function Body({ profile, nickname, photo, password, data, about, actions, children, onError, describeError }: AccountScreenProps) {
  const { strings, components } = useLook();
  const styles = useStyles((t) => ({ body: { gap: 16, paddingBottom: 40 }, note: { color: t.accent, fontSize: 13, lineHeight: 18 } }));
  const action = useAction(onError, describeError);
  const [page, setPage] = useState<'main' | 'password'>('main');
  const go = (next: 'main' | 'password') => {
    action.setNote(null);
    setPage(next);
  };
  const note = action.note ? <components.Text style={styles.note} accessibilityLiveRegion="polite">{action.note}</components.Text> : null;

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
      {page === 'password' && password ? (
        <Page title={strings.changePassword} onBack={() => go('main')}>
          {note}
          <PasswordPage {...password} action={action} onDone={() => setPage('main')} />
        </Page>
      ) : (
        <>
          <ProfileSection profile={profile} nickname={nickname} photo={photo} password={password} data={data} action={action} onOpenPassword={() => go('password')} />
          {note}
          {children ? <View style={{ gap: 16 }}>{children}</View> : null}
          <AboutSection {...about} action={action} />
          <ActionsSection {...actions} action={action} />
        </>
      )}
    </ScrollView>
  );
}

/**
 * The whole Account body: Profile, the app's own settings (children), About, then Sign out and Delete account.
 * The app draws its own header and page background around it.
 */
export function AccountScreen({ theme, strings, components, ...props }: Props) {
  return (
    <AccountProvider theme={theme} strings={strings} components={components}>
      <Body {...props} />
    </AccountProvider>
  );
}

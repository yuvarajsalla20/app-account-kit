import { ScrollView, View } from 'react-native';
import { AccountProvider, useLook, useStyles, type AccountComponents } from './context';
import { useAction } from './hooks/useAction';
import { ActionsSection } from './sections/ActionsSection';
import { AboutSection } from './sections/AboutSection';
import { ProfileSection } from './sections/ProfileSection';
import type { AccountStrings } from './strings';
import type { AccountTheme } from './theme';
import type { AccountScreenProps } from './types';

type Props = AccountScreenProps & {
  theme?: Partial<AccountTheme>;
  strings?: Partial<AccountStrings>;
  components?: Partial<AccountComponents>;
};

function Body({ profile, nickname, photo, password, data, about, actions, children, onError, describeError }: AccountScreenProps) {
  const { components } = useLook();
  const styles = useStyles((t) => ({ body: { gap: 16, paddingBottom: 40 }, note: { color: t.accent, fontSize: 13, lineHeight: 18 } }));
  const action = useAction(onError, describeError);
  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
      <ProfileSection profile={profile} nickname={nickname} photo={photo} password={password} data={data} action={action} />
      {action.note ? <components.Text style={styles.note} accessibilityLiveRegion="polite">{action.note}</components.Text> : null}
      {children ? <View style={{ gap: 16 }}>{children}</View> : null}
      <AboutSection {...about} action={action} />
      <ActionsSection {...actions} action={action} />
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

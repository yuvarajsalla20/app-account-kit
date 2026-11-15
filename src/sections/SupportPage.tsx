import Feather from '@expo/vector-icons/Feather';
import { Linking, Platform, View } from 'react-native';
import { useLook, useStyles } from '../look';
import type { ActionRunner } from '../hooks/useAction';
import { KIT_VERSION } from '../kit';
import { kitsMailLine } from '../logic/kits';
import { supportMailUrl } from '../logic/mail';
import type { AccountTheme } from '../theme';
import type { AboutProps } from '../types';
import { Button } from '../ui/Button';
import { STACK } from '../ui/Group';

interface Props extends Pick<AboutProps, 'appName' | 'version' | 'supportEmail' | 'kits'> {
  action: ActionRunner;
}

/**
 * About › Contact Support: a calm page instead of a bare address. A short welcome, one button that writes the email
 * (with the app version, device and kits already filled in), and a line saying so. The address shows only when no mail app is set up.
 */
export function SupportPage({ appName, version, supportEmail, kits, action }: Props) {
  const { theme, strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const write = () =>
    Linking.openURL(supportMailUrl({ email: supportEmail, appName, versionNumber: version.number, device: `${Platform.OS} ${Platform.Version}`, kits: kits ? kitsMailLine(kits) : `account ${KIT_VERSION}` })).catch(() =>
      action.setNote(strings.noMail(supportEmail)),
    );
  return (
    <View style={STACK}>
      <View style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: `${theme.tints.support}26` }]}>
          <Feather name="mail" size={34} color={theme.tints.support} />
        </View>
        <components.Text style={styles.title} accessibilityRole="header">{strings.supportTitle}</components.Text>
        <components.Text style={styles.body}>{strings.supportBody}</components.Text>
      </View>
      <Button variant="solid" icon="send" label={strings.writeToUs} onPress={write} />
      <components.Text style={styles.note}>{strings.supportNote}</components.Text>
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  hero: { alignItems: 'center' as const, gap: 10, paddingTop: 8, paddingBottom: 8, paddingHorizontal: 12 },
  badge: { width: 84, height: 84, borderRadius: 42, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 6 },
  title: { color: t.text, fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.4, textAlign: 'center' as const },
  body: { color: t.muted, fontSize: 16, lineHeight: 23, textAlign: 'center' as const },
  note: { color: t.muted, fontSize: 13, lineHeight: 18, textAlign: 'center' as const, paddingHorizontal: 16, marginTop: -6 },
});

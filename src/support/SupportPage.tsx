import { Linking, Platform, View } from 'react-native';
import { useLook, useStyles } from '../look';
import type { ActionRunner } from '../shared/useAction';
import { KIT_VERSION } from '../kit';
import { kitsMailLine } from '../shared/kits';
import { supportMailUrl } from './mail';
import type { AccountTheme } from '../theme';
import type { AboutProps } from '../types';
import { SettingRow } from '../ui/Row';
import { STACK } from '../ui/Group';

interface Props extends Pick<AboutProps, 'appName' | 'version' | 'supportEmail' | 'kits'> {
  action: ActionRunner;
}

/**
 * About › Contact Support, drawn like the kit's other pages (7.18.0): the page title stays in the header, then a short
 * left-aligned heading and line, one row that writes the email (with the app version, device and kits already filled in),
 * and a small note under it. The address shows only when no mail app is set up.
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
      <View style={styles.intro}>
        <components.Text style={styles.title}>{strings.supportTitle}</components.Text>
        <components.Text style={styles.body}>{strings.supportBody}</components.Text>
      </View>
      <View style={styles.group}>
        <components.Card radius={theme.radius}>
          <SettingRow icon="mail" tint={theme.tints.support} label={strings.writeToUs} onPress={write} last />
        </components.Card>
        <components.Text style={styles.note}>{strings.supportNote}</components.Text>
      </View>
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  intro: { gap: 4 },
  title: { color: t.text, fontSize: 16, fontWeight: '600' as const },
  body: { color: t.muted, fontSize: 15, lineHeight: 21 },
  group: { gap: 8 },
  note: { color: t.muted, fontSize: 12, lineHeight: 17 },
});

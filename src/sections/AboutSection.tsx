import { Image, Linking, Platform, Pressable, Share, View } from 'react-native';
import { useLook, useStyles } from '../look';
import type { ActionRunner } from '../hooks/useAction';
import { supportMailUrl } from '../logic/mail';
import { KIT_VERSION } from '../kit';
import { kitLines } from '../logic/kits';
import { isHttps } from '../logic/links';
import { canRate, reviewUrl, reviewWebUrl } from '../logic/rate';
import { buildShareMessage, canShare } from '../logic/share';
import type { AccountTheme } from '../theme';
import type { AboutProps } from '../types';
import { ExpandRow } from '../ui/ExpandRow';
import { SettingsGroup, STACK } from '../ui/Group';
import { SettingRow } from '../ui/Row';

interface Props extends AboutProps {
  action: ActionRunner;
}

/** The app's picture, name (in the app's own color) and version, then Contact support and Kits (both open in place), Share, Rate and Privacy policy. */
export function AboutSection({ appName, logo, version, privacyUrl, supportEmail, share, rate, kits, action }: Props) {
  const { theme, strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const shareUrl = share?.url;
  const storeId = rate?.appStoreId;

  const contact = () =>
    Linking.openURL(supportMailUrl({ email: supportEmail, appName, versionNumber: version.number, device: `${Platform.OS} ${Platform.Version}`, kits: kits ?? `account ${KIT_VERSION}` })).catch(() =>
      action.setNote(strings.noMail(supportEmail)),
    );
  // Before the app is on the App Store there is nothing to share or rate: say so instead of doing nothing.
  const notYet = () => action.setNote(strings.notOnStoreYet, true);

  return (
    <View style={STACK}>
      <View style={styles.hero}>
        {logo ? <Image source={logo} style={styles.logo} accessible={false} /> : null}
        <components.Text style={styles.name} accessibilityRole="header">{appName}</components.Text>
        <components.Text style={styles.version}>{version.label}</components.Text>
      </View>
      <SettingsGroup>
        <ExpandRow icon="mail" tint={theme.tints.support} label={strings.contactSupport}>
          <Pressable onPress={contact} accessibilityRole="link" accessibilityLabel={supportEmail} style={styles.mail}>
            <components.Text style={styles.address}>{supportEmail}</components.Text>
            <components.Text style={styles.hint}>{strings.supportHint}</components.Text>
          </Pressable>
        </ExpandRow>
        {share ? (
          <SettingRow
            icon="share"
            tint={theme.tints.share}
            label={strings.share}
            onPress={() =>
              canShare(shareUrl)
                ? action.run('share', () => Share.share({ message: buildShareMessage(strings.shareMessage, appName, shareUrl, share.message) }).then(() => undefined), () => strings.couldNot(strings.shareApp), { patient: true })
                : notYet()
            }
          />
        ) : null}
        {rate && Platform.OS === 'ios' ? (
          <SettingRow
            icon="star"
            tint={theme.tints.rate}
            label={strings.rate}
            onPress={() =>
              canRate(storeId)
                ? action.run('rate', () => Linking.openURL(reviewUrl(storeId)).catch(() => Linking.openURL(reviewWebUrl(storeId))).then(() => undefined), () => strings.couldNot(strings.openStore))
                : notYet()
            }
          />
        ) : null}
        <SettingRow
          last={!kits}
          icon="shield"
          tint={theme.tints.privacy}
          label={strings.privacy}
          onPress={() => {
            action.run('privacy', () => (isHttps(privacyUrl) ? Linking.openURL(privacyUrl) : Promise.reject(new Error('not-https'))).then(() => undefined), () => strings.couldNot(strings.openLink));
          }}
        />
        {kits ? (
          <ExpandRow last icon="package" tint={theme.tints.version} label={strings.kits}>
            {kitLines(kits).map((line) => (
              <components.Text key={line} style={styles.kit}>{line}</components.Text>
            ))}
          </ExpandRow>
        ) : null}
      </SettingsGroup>
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  hero: { alignItems: 'center' as const, paddingTop: 8, paddingBottom: 12, gap: 6 },
  logo: { width: 84, height: 84, borderRadius: 20, marginBottom: 6 },
  name: { color: t.brand, fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.6, textAlign: 'center' as const },
  version: { color: t.muted, fontSize: 12, textAlign: 'center' as const },
  mail: { minHeight: 44, justifyContent: 'center' as const, gap: 2, paddingLeft: 46 },
  address: { color: t.accent, fontSize: 15, fontWeight: '600' as const },
  hint: { color: t.muted, fontSize: 12 },
  kit: { color: t.muted, fontSize: 14, lineHeight: 24, paddingLeft: 46 },
});

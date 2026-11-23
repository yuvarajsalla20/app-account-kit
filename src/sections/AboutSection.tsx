import { isValidElement } from 'react';
import { Image, Linking, Platform, Share, View } from 'react-native';
import { useLook, useStyles } from '../look';
import type { ActionRunner } from '../hooks/useAction';
import { kitListLines } from '../logic/kits';
import { isHttps } from '../logic/links';
import { canRate, canRatePlay, playReviewUrl, playReviewWebUrl, reviewUrl, reviewWebUrl } from '../logic/rate';
import { buildShareMessage, canShare } from '../logic/share';
import type { AccountTheme } from '../theme';
import type { AboutProps, ExtraPage } from '../types';
import { PageRow } from './AccountPage';
import { ExpandRow } from '../ui/ExpandRow';
import { SettingsGroup, STACK } from '../ui/Group';
import { SettingRow } from '../ui/Row';

interface Props extends AboutProps {
  action: ActionRunner;
  /** Opens Contact Support, a page of its own under About. */
  onOpenSupport: () => void;
  /** 7.37.0: the app's help pages (`under: 'about'`), as rows in the Help card after Contact Support. */
  helpPages?: readonly ExtraPage[];
  /** Opens one of those pages by its id. */
  onOpenPage?: (page: string) => void;
}

/**
 * The app's picture and name (in the app's own color), then three cards:
 * Features, Rate and Share; Contact Support (its own page) and Privacy Policy; Kits and Version (both open in place).
 */
export function AboutSection({ appName, logo, showHeader = true, version, privacyUrl, featuresUrl, share, rate, kits, action, onOpenSupport, helpPages = [], onOpenPage }: Props) {
  const { theme, strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const shareUrl = share?.url;
  const storeId = rate?.appStoreId;
  const playPackage = rate?.playPackage;
  // iPhone: the App Store review screen. Android (7.27.0): the app's Play Store page, only once the app passes its package name.
  const onAndroid = Platform.OS === 'android';
  // 7.29.0: each row shows only when it has somewhere to go (a secure link to share, a real App Store number or Play package),
  // so an app can always pass its store constants and nothing shows before the app is on the store.
  const showRate = Platform.OS === 'ios' ? canRate(storeId) : onAndroid && canRatePlay(playPackage);
  const showShare = canShare(shareUrl);
  const openPage = (key: string, url: string) =>
    action.run(key, () => (isHttps(url) ? Linking.openURL(url) : Promise.reject(new Error('not-https'))).then(() => undefined), () => strings.couldNot(strings.openLink));
  const lines = (list: readonly string[]) => list.map((line) => <components.Text key={line} style={styles.line}>{line}</components.Text>);

  return (
    <View style={STACK}>
      {showHeader === 'logo' ? (
        logo ? (
          <View style={styles.hero}>
            {isValidElement(logo) ? logo : (
              <View style={styles.logoShadow}>
                <Image source={logo} style={styles.logoLarge} accessibilityLabel={`${appName} logo`} accessibilityIgnoresInvertColors />
              </View>
            )}
          </View>
        ) : null
      ) : showHeader ? (
        <View style={styles.hero}>
          {/* A drawn logo (7.21.0) goes in as it is, at its own size; an image keeps the 84 pt rounded square. */}
          {isValidElement(logo) ? logo : logo ? <Image source={logo} style={styles.logo} accessible={false} /> : null}
          <components.Text style={styles.name} accessibilityRole="header">{appName}</components.Text>
        </View>
      ) : null}
      {featuresUrl || showShare || showRate ? (
        <SettingsGroup title={strings.aboutAppGroup || undefined}>
          {featuresUrl ? <SettingRow last={!showRate && !showShare} external icon="layers" tint={theme.tints.features ?? theme.tints.about} label={strings.features} onPress={() => openPage('features', featuresUrl)} /> : null}
          {showRate ? (
            <SettingRow
              last={!showShare}
              icon="star"
              tint={theme.tints.rate}
              label={strings.rate}
              onPress={() =>
                onAndroid && canRatePlay(playPackage)
                  ? action.run('rate', () => Linking.openURL(playReviewUrl(playPackage)).catch(() => Linking.openURL(playReviewWebUrl(playPackage))).then(() => undefined), () => strings.couldNot(strings.openPlayStore))
                  : canRate(storeId)
                  ? action.run('rate', () => Linking.openURL(reviewUrl(storeId)).catch(() => Linking.openURL(reviewWebUrl(storeId))).then(() => undefined), () => strings.couldNot(strings.openStore))
                  : undefined
              }
            />
          ) : null}
          {showShare ? (
            <SettingRow
              last
              icon="share"
              tint={theme.tints.share}
              label={strings.share}
              onPress={() => action.run('share', () => Share.share({ message: buildShareMessage(strings.shareMessage, appName, shareUrl, share?.message) }).then(() => undefined), () => strings.couldNot(strings.shareApp), { patient: true })}
            />
          ) : null}
        </SettingsGroup>
      ) : null}
      <SettingsGroup title={strings.aboutHelpGroup || undefined}>
        <SettingRow icon="mail" tint={theme.tints.support} label={strings.contactSupport} onPress={onOpenSupport} />
        {helpPages.map((p) => (
          <PageRow key={p.id} page={p} last={false} tint={p.tint ?? theme.tints.support} onOpen={() => onOpenPage?.(p.id)} />
        ))}
        <SettingRow last external icon="shield" tint={theme.tints.privacy} label={strings.privacy} onPress={() => openPage('privacy', privacyUrl)} />
      </SettingsGroup>
      {strings.aboutInfoGroup ? (
        // 7.26.0: under a heading, Version comes first and Kits last.
        <SettingsGroup title={strings.aboutInfoGroup}>
          <ExpandRow last={!kits} icon="info" tint={theme.tints.version} label={strings.version}>
            {lines(version.lines?.length ? version.lines : [version.label])}
          </ExpandRow>
          {kits ? (
            <ExpandRow last icon="package" tint={theme.tints.version} label={strings.kits}>
              {lines(kitListLines(kits, strings.build))}
            </ExpandRow>
          ) : null}
        </SettingsGroup>
      ) : (
        <SettingsGroup>
          {kits ? (
            <ExpandRow icon="package" tint={theme.tints.version} label={strings.kits}>
              {lines(kitListLines(kits, strings.build))}
            </ExpandRow>
          ) : null}
          <ExpandRow last icon="info" tint={theme.tints.version} label={strings.version}>
            {lines(version.lines?.length ? version.lines : [version.label])}
          </ExpandRow>
        </SettingsGroup>
      )}
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  hero: { alignItems: 'center' as const, paddingTop: 0, paddingBottom: 12, gap: 6 },
  logo: { width: 84, height: 84, borderRadius: 20, marginBottom: 6 },
  // 7.30.0: the logo on its own under the About title, at 104 pt with the home screen's rounded corners (22.5%) and a soft shadow.
  logoShadow: { marginTop: 4, marginBottom: 6, borderRadius: 23.4, shadowColor: t.brand, shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  logoLarge: { width: 104, height: 104, borderRadius: 23.4 },
  name: { color: t.brand, fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.6, textAlign: 'center' as const },
  line: { color: t.muted, fontSize: 14, lineHeight: 22, paddingLeft: 46 },
});

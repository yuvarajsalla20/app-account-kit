import { Linking, Platform, Share } from 'react-native';
import { useLook } from '../look';
import type { ActionRunner } from '../hooks/useAction';
import { supportMailUrl } from '../logic/mail';
import { KIT_VERSION } from '../kit';
import { isHttps } from '../logic/links';
import { canRate, reviewUrl, reviewWebUrl } from '../logic/rate';
import { buildShareMessage, canShare } from '../logic/share';
import type { AboutProps } from '../types';
import { SettingsGroup } from '../ui/Group';
import { SettingRow } from '../ui/Row';

interface Props extends AboutProps {
  action: ActionRunner;
}

/** Share the app, Rate the app, Privacy policy, Contact support and the Version. */
export function AboutSection({ appName, version, privacyUrl, supportEmail, share, rate, kits, action }: Props) {
  const { theme, strings } = useLook();
  const shareUrl = share?.url;
  const storeId = rate?.appStoreId;

  const contact = () =>
    Linking.openURL(supportMailUrl({ email: supportEmail, appName, versionNumber: version.number, device: `${Platform.OS} ${Platform.Version}`, kits: kits ?? `account ${KIT_VERSION}` })).catch(() =>
      action.setNote(strings.noMail(supportEmail)),
    );

  return (
    <SettingsGroup>
      {canShare(shareUrl) ? (
        <SettingRow
          icon="share"
          tint={theme.tints.share}
          label={strings.share(appName)}
          onPress={() => {
            action.run('share', () => Share.share({ message: buildShareMessage(strings.shareMessage, appName, shareUrl, share?.message) }).then(() => undefined), () => strings.couldNot(strings.shareApp));
          }}
        />
      ) : null}
      {Platform.OS === 'ios' && canRate(storeId) ? (
        <SettingRow
          icon="star"
          tint={theme.tints.rate}
          label={strings.rate(appName)}
          onPress={() => {
            action.run('rate', () => Linking.openURL(reviewUrl(storeId)).catch(() => Linking.openURL(reviewWebUrl(storeId))).then(() => undefined), () => strings.couldNot(strings.openStore));
          }}
        />
      ) : null}
      <SettingRow
        icon="shield"
        tint={theme.tints.privacy}
        label={strings.privacy}
        onPress={() => {
          action.run('privacy', () => (isHttps(privacyUrl) ? Linking.openURL(privacyUrl) : Promise.reject(new Error('not-https'))).then(() => undefined), () => strings.couldNot(strings.openLink));
        }}
      />
      <SettingRow icon="mail" tint={theme.tints.support} label={strings.contactSupport} onPress={contact} />
      <SettingRow last={!kits} icon="info" tint={theme.tints.version} label={strings.version} value={version.label} />
      {kits ? <SettingRow last icon="package" tint={theme.tints.version} label={strings.kits} value={kits} /> : null}
    </SettingsGroup>
  );
}

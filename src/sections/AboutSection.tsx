import { Linking, Platform, Share } from 'react-native';
import { useLook } from '../context';
import type { ActionRunner } from '../hooks/useAction';
import { supportMailUrl } from '../logic/mail';
import { canRate, reviewUrl, reviewWebUrl } from '../logic/rate';
import { buildShareMessage, canShare } from '../logic/share';
import type { AboutProps } from '../types';
import { SettingsGroup } from '../ui/Group';
import { SettingRow } from '../ui/Row';

interface Props extends AboutProps {
  action: ActionRunner;
}

/** Share the app, Rate the app, Privacy policy, Contact support and the Version. */
export function AboutSection({ appName, version, privacyUrl, supportEmail, share, rate, action }: Props) {
  const { theme, strings } = useLook();
  const shareUrl = share?.url;
  const storeId = rate?.appStoreId;

  const contact = () =>
    Linking.openURL(supportMailUrl({ email: supportEmail, appName, versionNumber: version.number, device: `${Platform.OS} ${Platform.Version}` })).catch(() =>
      action.setNote(strings.noMail(supportEmail)),
    );

  return (
    <SettingsGroup title={strings.about}>
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
      <SettingRow icon="shield" tint={theme.tints.privacy} label={strings.privacy} onPress={() => Linking.openURL(privacyUrl).catch(() => undefined)} />
      <SettingRow icon="mail" tint={theme.tints.support} label={strings.contactSupport} onPress={contact} />
      <SettingRow last icon="info" tint={theme.tints.version} label={strings.version} value={version.label} />
    </SettingsGroup>
  );
}

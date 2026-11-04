import { Linking, Platform, Share } from 'react-native';
import { useLook } from '../context';
import type { ActionRunner } from '../hooks/useAction';
import { supportMailUrl } from '../logic/mail';
import { buildShareMessage, canShare } from '../logic/share';
import type { AboutProps } from '../types';
import { SettingsGroup } from '../ui/Group';
import { SettingRow } from '../ui/Row';
import { TINTS } from '../ui/tints';

interface Props extends AboutProps {
  action: ActionRunner;
}

/** Share the app, Privacy policy, Contact support and the Version. */
export function AboutSection({ appName, version, privacyUrl, supportEmail, share, action }: Props) {
  const { strings } = useLook();
  const shareUrl = share?.url;

  const contact = () =>
    Linking.openURL(supportMailUrl({ email: supportEmail, appName, versionNumber: version.number, device: `${Platform.OS} ${Platform.Version}` })).catch(() =>
      action.setNote(strings.noMail(supportEmail)),
    );

  return (
    <SettingsGroup title={strings.about}>
      {canShare(shareUrl) ? (
        <SettingRow
          icon="share"
          tint={TINTS.share}
          label={strings.share(appName)}
          onPress={() => {
            action.run('share', () => Share.share({ message: buildShareMessage(strings.shareMessage, appName, shareUrl, share?.message) }).then(() => undefined), () => strings.couldNot(strings.shareApp));
          }}
        />
      ) : null}
      <SettingRow icon="shield" tint={TINTS.privacy} label={strings.privacy} onPress={() => Linking.openURL(privacyUrl).catch(() => undefined)} />
      <SettingRow icon="mail" tint={TINTS.support} label={strings.contactSupport} onPress={contact} />
      <SettingRow last icon="info" tint={TINTS.version} label={strings.version} detail={version.label} />
    </SettingsGroup>
  );
}

import { View } from 'react-native';
import { useLook } from '../look';
import type { ActionRunner } from '../hooks/useAction';
import type { NicknameProps, PasswordProps, PhotoProps, ProfileInfo } from '../types';
import { SettingsGroup, STACK } from '../ui/Group';
import { SettingRow } from '../ui/Row';
import { EmailRow } from './profile/EmailRow';
import { NicknameRow } from './profile/NicknameRow';
import { ProfileHeader } from './profile/ProfileHeader';

interface Props {
  profile: ProfileInfo;
  nickname: NicknameProps;
  photo?: PhotoProps;
  /** Only its presence matters here: Change password shows when the app passes it. */
  password?: PasswordProps;
  action: ActionRunner;
  onOpenPassword: () => void;
}

/** Picture and name, then one card: the nickname, the email (read only) and Change password. Delete account lives on the main list. */
export function AccountPage({ profile, nickname, photo, password, action, onOpenPassword }: Props) {
  const { theme, strings } = useLook();
  const hasPassword = !!(password && profile.email);
  return (
    <View style={STACK}>
      <ProfileHeader profile={profile} photo={photo} action={action} />
      <SettingsGroup>
        <NicknameRow saved={profile.name} {...nickname} action={action} last={!profile.email && !hasPassword} />
        {profile.email ? <EmailRow email={profile.email} last={!hasPassword} /> : null}
        {hasPassword ? <SettingRow last icon="key" tint={theme.tints.password} label={strings.changePassword} onPress={onOpenPassword} /> : null}
      </SettingsGroup>
    </View>
  );
}

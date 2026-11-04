import { View } from 'react-native';
import { useLook } from '../context';
import type { ActionRunner } from '../hooks/useAction';
import type { ActionsProps, NicknameProps, PasswordProps, PhotoProps, ProfileInfo } from '../types';
import { SettingsGroup } from '../ui/Group';
import { SettingRow } from '../ui/Row';
import { DeleteAccount } from './DeleteAccount';
import { NicknameRow } from './profile/NicknameRow';
import { ProfileHeader } from './profile/ProfileHeader';

interface Props extends Pick<ActionsProps, 'onDeleteAccount' | 'confirmsWithPassword'> {
  profile: ProfileInfo;
  nickname: NicknameProps;
  photo?: PhotoProps;
  /** Only its presence matters here: Change password shows when the app passes it. */
  password?: PasswordProps;
  action: ActionRunner;
  onOpenPassword: () => void;
}

/** Picture and name, the nickname and Change password in one card, then Delete account. */
export function AccountPage({ profile, nickname, photo, password, action, onOpenPassword, onDeleteAccount, confirmsWithPassword }: Props) {
  const { theme, strings } = useLook();
  return (
    <View style={{ gap: 16 }}>
      <ProfileHeader profile={profile} photo={photo} action={action} />
      <SettingsGroup>
        <NicknameRow saved={profile.name} {...nickname} action={action} />
        {password && profile.email ? <SettingRow last icon="key" tint={theme.tints.password} label={strings.changePassword} onPress={onOpenPassword} /> : null}
      </SettingsGroup>
      <DeleteAccount onDeleteAccount={onDeleteAccount} confirmsWithPassword={confirmsWithPassword} action={action} />
    </View>
  );
}

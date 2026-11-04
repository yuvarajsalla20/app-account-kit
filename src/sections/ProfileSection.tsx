import { View } from 'react-native';
import { useLook } from '../context';
import type { ActionRunner } from '../hooks/useAction';
import type { DataProps, NicknameProps, PasswordProps, PhotoProps, ProfileInfo } from '../types';
import { SettingsGroup } from '../ui/Group';
import { SettingRow } from '../ui/Row';
import { DataRow } from './profile/DataRow';
import { NicknameRow } from './profile/NicknameRow';
import { ProfileHeader } from './profile/ProfileHeader';

interface Props {
  profile: ProfileInfo;
  nickname: NicknameProps;
  photo?: PhotoProps;
  /** Only its presence matters here: Change password shows when the app passes it. */
  password?: PasswordProps;
  data?: DataProps;
  action: ActionRunner;
  onOpenPassword: () => void;
}

/** Picture and name, the nickname and Change password in one card, then the data download. */
export function ProfileSection({ profile, nickname, photo, password, data, action, onOpenPassword }: Props) {
  const { theme, strings } = useLook();
  return (
    <View style={{ gap: 16 }}>
      <ProfileHeader profile={profile} photo={photo} action={action} />
      <SettingsGroup title={strings.profile}>
        <NicknameRow saved={profile.name} {...nickname} action={action} />
        {password && profile.email ? <SettingRow last icon="key" tint={theme.tints.password} label={strings.changePassword} onPress={onOpenPassword} /> : null}
      </SettingsGroup>
      {data ? (
        <SettingsGroup title={strings.yourData}>
          <DataRow {...data} action={action} />
        </SettingsGroup>
      ) : null}
    </View>
  );
}

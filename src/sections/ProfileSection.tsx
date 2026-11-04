import { View } from 'react-native';
import { useLook } from '../context';
import type { ActionRunner } from '../hooks/useAction';
import type { DataProps, NicknameProps, PasswordProps, PhotoProps, ProfileInfo } from '../types';
import { SettingsGroup } from '../ui/Group';
import { DataRow } from './profile/DataRow';
import { NicknameRow } from './profile/NicknameRow';
import { PasswordRow } from './profile/PasswordRow';
import { ProfileHeader } from './profile/ProfileHeader';

interface Props {
  profile: ProfileInfo;
  nickname: NicknameProps;
  photo?: PhotoProps;
  password?: PasswordProps;
  data?: DataProps;
  action: ActionRunner;
}

/** Picture and name, the nickname and Change password in one card, then the data download. */
export function ProfileSection({ profile, nickname, photo, password, data, action }: Props) {
  const { strings } = useLook();
  return (
    <View style={{ gap: 16 }}>
      <ProfileHeader profile={profile} photo={photo} action={action} />
      <SettingsGroup title={strings.profile}>
        <NicknameRow saved={profile.name} {...nickname} action={action} />
        {password && profile.email ? <PasswordRow {...password} email={profile.email} action={action} /> : null}
      </SettingsGroup>
      {data ? (
        <SettingsGroup title={strings.yourData}>
          <DataRow {...data} action={action} />
        </SettingsGroup>
      ) : null}
    </View>
  );
}

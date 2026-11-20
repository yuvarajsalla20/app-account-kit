import { View } from 'react-native';
import { useLook } from '../look';
import type { ActionRunner } from '../hooks/useAction';
import type { ExtraPage, NicknameProps, PasswordProps, PhotoProps, ProfileInfo } from '../types';
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
  /** The app's pages that live here (`under: 'account'`), as rows under Your Data. */
  dataPages?: readonly ExtraPage[];
  /** Opens a page under Your data by its id. */
  onOpen?: (page: string) => void;
  /** 7.24.0 (`exitMenu.place: 'page'`): opens the Access page from a row at the bottom. Leave out for no row. */
  onOpenAccess?: () => void;
}

/** Picture and name, then one card: the nickname, the email (read only) and Change password; then a card of the app's data features (such as Data Export), with no heading of its own; then, with `onOpenAccess`, one Access row (Sign out and Delete account). */
export function AccountPage({ profile, nickname, photo, password, action, onOpenPassword, dataPages = [], onOpen, onOpenAccess }: Props) {
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
      {dataPages.length ? (
        <SettingsGroup>
          {dataPages.map((p, i) => (
            <SettingRow key={p.id} last={i === dataPages.length - 1} icon={p.icon} tint={p.tint ?? theme.tints.data} label={p.label} value={p.value} badge={p.badge} onPress={() => onOpen?.(p.id)} />
          ))}
        </SettingsGroup>
      ) : null}
      {onOpenAccess ? (
        <SettingsGroup>
          <SettingRow last icon="log-out" tint={theme.muted} label={strings.access} onPress={onOpenAccess} />
        </SettingsGroup>
      ) : null}
    </View>
  );
}

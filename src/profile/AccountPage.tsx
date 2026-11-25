import { View } from 'react-native';
import { useLook } from '../look';
import { useSettingsNav } from '../hub/nav';
import type { ActionRunner } from '../shared/useAction';
import type { ExtraPage, NicknameProps, PasswordProps, PhotoProps, ProfileInfo } from '../types';
import { SettingsGroup, STACK } from '../ui/Group';
import { MenuRow } from '../ui/PullDown';
import { SettingRow } from '../ui/Row';
import { EmailRow } from './EmailRow';
import { NicknameRow } from './NicknameRow';
import { ProfileHeader } from './ProfileHeader';

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
  /** 7.25.0 (`exitMenu.signOutOnAccount`): a Sign out row of its own, in the same card, above the Access row. */
  onOpenSignOut?: () => void;
  /** 7.26.0 (`exitMenu.signOutMenu`): the Sign out row opens a small menu instead, and this signs out from it. */
  onSignOutNow?: () => void;
}

/** Picture and name, then one card: the nickname, the email (read only) and Change password; then a card of the app's data features (such as Data Export), with no heading of its own; then, with `onOpenAccess`, one Access row (Sign out and Delete account). */
export function AccountPage({ profile, nickname, photo, password, action, onOpenPassword, dataPages = [], onOpen, onOpenAccess, onOpenSignOut, onSignOutNow }: Props) {
  const { theme, strings } = useLook();
  const hasPassword = !!(password && profile.email);
  return (
    <View style={STACK}>
      <ProfileHeader profile={profile} photo={photo} action={action} />
      <SettingsGroup title={strings.profileGroup || undefined}>
        <NicknameRow saved={profile.name} {...nickname} action={action} last={!profile.email && !hasPassword} />
        {profile.email ? <EmailRow email={profile.email} last={!hasPassword} /> : null}
        {hasPassword ? <SettingRow last icon="key" tint={theme.tints.password} label={strings.changePassword} onPress={onOpenPassword} /> : null}
      </SettingsGroup>
      {dataPages.length ? (
        <SettingsGroup title={strings.dataGroup || undefined}>
          {dataPages.map((p, i) => (
            <PageRow key={p.id} page={p} last={i === dataPages.length - 1} tint={p.tint ?? theme.tints.data} onOpen={() => onOpen?.(p.id)} />
          ))}
        </SettingsGroup>
      ) : null}
      {onOpenAccess || onOpenSignOut || onSignOutNow ? (
        <SettingsGroup title={strings.exitGroup || undefined}>
          {onSignOutNow ? (
            <MenuRow
              head={strings.signOutBody}
              items={[
                { id: 'signOut', label: strings.signOut, icon: 'log-out', danger: true },
                { id: 'stay', label: strings.stayIn, icon: 'x' },
              ]}
              onPick={(id) => (id === 'signOut' ? onSignOutNow() : undefined)}
            >
              {(show) => <SettingRow last={!onOpenAccess} icon="log-out" tint={theme.muted} label={strings.signOut} opensMenu onPress={show} />}
            </MenuRow>
          ) : onOpenSignOut ? <SettingRow last={!onOpenAccess} icon="log-out" tint={theme.muted} label={strings.signOut} onPress={onOpenSignOut} /> : null}
          {onOpenAccess ? <SettingRow last icon={onOpenSignOut || onSignOutNow ? 'user-x' : 'log-out'} tint={theme.muted} label={strings.access} onPress={onOpenAccess} /> : null}
        </SettingsGroup>
      ) : null}
    </View>
  );
}

/** One of the app's rows (Data Export): opens its page, or with `menu` (7.26.0) a pull-down menu in place. Shared with the App page. */
export function PageRow({ page: p, last, tint, onOpen }: { page: ExtraPage; last: boolean; tint: string; onOpen: () => void }) {
  const nav = useSettingsNav();
  // 7.34.0: a locked Premium row shows only the gold padlock; a tap opens the plans (or the page).
  // 7.35.0: with no onLocked, `lockedOpens` names the Settings page to open, such as the plan page.
  const lockedOpens = p.lockedOpens;
  const onLockedTap = p.onLocked ?? (lockedOpens && nav ? () => nav.open(lockedOpens) : onOpen);
  if (p.locked) return <SettingRow last={last} icon={p.icon} tint={tint} label={p.label} premium={p.premium} locked onPress={onLockedTap} />;
  if (p.toggle) return <SettingRow last={last} icon={p.icon} tint={tint} label={p.label} premium={p.premium} toggle={p.toggle} />;
  if (p.menu) {
    const m = p.menu;
    return (
      <MenuRow pill={m.pill} head={m.head} items={m.items} onPick={m.onPick}>
        {(show, badge) => <SettingRow last={last} icon={p.icon} tint={tint} label={p.label} premium={p.premium} value={p.value ?? m.pill} badge={badge ?? p.badge} opensMenu onPress={show} />}
      </MenuRow>
    );
  }
  return <SettingRow last={last} icon={p.icon} tint={tint} label={p.label} premium={p.premium} value={p.value} badge={p.badge} onPress={onOpen} />;
}

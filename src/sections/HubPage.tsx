import { View } from 'react-native';
import { useLook } from '../context';
import { hubPages, type Page } from '../logic/pages';
import type { SettingsScreenProps } from '../types';
import { Button } from '../ui/Button';
import { SettingsGroup, STACK } from '../ui/Group';
import { SettingRow } from '../ui/Row';

type Props = Pick<SettingsScreenProps, 'profile' | 'data' | 'app' | 'about'> & {
  onSignOut?: () => void;
  onOpen: (page: Page) => void;
  /** A save or delete is running: Sign out waits. */
  busy: boolean;
};

/** The main list: Account, My data, App and About, each a row with a small hint, then Sign out. */
export function HubPage({ profile, data, app, about, onSignOut, onOpen, busy }: Props) {
  const { theme, strings } = useLook();
  const rows = {
    account: { icon: 'user', label: strings.account, hint: profile.email ?? profile.name },
    data: { icon: 'download', label: strings.myData, hint: data?.value },
    app: { icon: 'sliders', label: strings.app, hint: app?.hint },
    about: { icon: 'info', label: strings.about, hint: `v${about.version.number}` },
  } as const;
  const pages = hubPages({ data: !!data, app: !!app });
  return (
    <View style={STACK}>
      <SettingsGroup>
        {pages.map((page, i) => (
          <SettingRow key={page} last={i === pages.length - 1} icon={rows[page].icon} tint={theme.tints[page]} label={rows[page].label} value={rows[page].hint || undefined} onPress={() => onOpen(page)} />
        ))}
      </SettingsGroup>
      {onSignOut ? <Button icon="log-out" label={strings.signOut} onPress={onSignOut} disabled={busy} /> : null}
    </View>
  );
}

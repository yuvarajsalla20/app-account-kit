import { View } from 'react-native';
import type { ActionRunner } from '../hooks/useAction';
import { useLook } from '../look';
import { hubPages, type Page } from '../logic/pages';
import type { SettingsScreenProps } from '../types';
import { Button } from '../ui/Button';
import { SettingsGroup, STACK } from '../ui/Group';
import { SettingRow } from '../ui/Row';

type Props = Pick<SettingsScreenProps, 'data' | 'app'> & {
  onSignOut?: () => Promise<void> | void;
  onOpen: (page: Page) => void;
  /** Sign out runs through it, so it waits for a save or delete and reports a failure. */
  action: ActionRunner;
};

/** The main list: Account, My data, App and About, each a row with an arrow and nothing else, then Sign out. */
export function HubPage({ data, app, onSignOut, onOpen, action }: Props) {
  const { theme, strings } = useLook();
  const rows = {
    account: { icon: 'user', label: strings.account },
    data: { icon: 'download', label: strings.myData },
    app: { icon: 'sliders', label: strings.app },
    about: { icon: 'info', label: strings.about },
  } as const;
  const pages = hubPages({ data: !!data, app: !!app });
  return (
    <View style={STACK}>
      <SettingsGroup>
        {pages.map((page, i) => (
          <SettingRow key={page} last={i === pages.length - 1} icon={rows[page].icon} tint={theme.tints[page]} label={rows[page].label} onPress={() => onOpen(page)} />
        ))}
      </SettingsGroup>
      {onSignOut ? <Button icon="log-out" label={strings.signOut} onPress={() => action.run('sign-out', onSignOut, () => strings.couldNot(strings.signOutAction))} disabled={action.busy} /> : null}
    </View>
  );
}

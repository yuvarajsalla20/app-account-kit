import { View } from 'react-native';
import type { ActionRunner } from '../hooks/useAction';
import { useLook } from '../look';
import { hubPages, type Page } from '../logic/pages';
import type { ActionsProps, IconName, SettingsScreenProps } from '../types';
import { Button } from '../ui/Button';
import { SettingsGroup, STACK } from '../ui/Group';
import { SettingRow } from '../ui/Row';
import { DeleteAccount } from './DeleteAccount';

type Props = Pick<SettingsScreenProps, 'data' | 'app' | 'hubOrder' | 'extraPages'> & Pick<ActionsProps, 'onSignOut' | 'onDeleteAccount' | 'confirmsWithPassword'> & {
  onOpen: (page: Page) => void;
  /** Sign out runs through it, so it waits for a save or delete and reports a failure. */
  action: ActionRunner;
  /** Called when the delete panel opens, so the screen can scroll it into view. */
  onReveal?: () => void;
};

/** The main list: Account, My data, App and About, each a row with an arrow and nothing else, then Sign out and Delete account side by side. */
export function HubPage({ data, app, hubOrder, extraPages = [], onSignOut, onDeleteAccount, confirmsWithPassword, onOpen, action, onReveal }: Props) {
  const { theme, strings } = useLook();
  const rows: Record<string, { icon: IconName; label: string; tint?: string }> = {
    account: { icon: 'user', label: strings.account },
    data: { icon: 'download', label: strings.myData },
    app: { icon: 'sliders', label: strings.app },
    about: { icon: 'info', label: strings.about },
    ...Object.fromEntries(extraPages.map((p) => [p.id, { icon: p.icon, label: p.label, tint: p.tint }])),
  };
  const pages = hubPages({ data: !!data, app: !!app }, hubOrder, extraPages.map((p) => p.id));
  return (
    <View style={STACK}>
      <SettingsGroup>
        {pages.map((page, i) => (
          <SettingRow key={page} last={i === pages.length - 1} icon={rows[page]!.icon} tint={rows[page]!.tint ?? theme.tints[page as keyof typeof theme.tints] ?? theme.tints.app} label={rows[page]!.label} onPress={() => onOpen(page)} />
        ))}
      </SettingsGroup>
      {/* Sign out and Delete account share one row. */}
      <DeleteAccount
        onDeleteAccount={onDeleteAccount}
        confirmsWithPassword={confirmsWithPassword}
        action={action}
        onReveal={onReveal}
        beside={onSignOut ? <Button variant="line" icon="log-out" label={strings.signOut} onPress={() => action.run('sign-out', onSignOut, () => strings.couldNot(strings.signOutAction))} disabled={action.busy} grow /> : null}
      />
    </View>
  );
}

import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useLook } from '../look';
import type { ExtraPage } from '../types';
import { SettingsGroup, STACK } from '../ui/Group';
import { SettingRow } from '../ui/Row';

interface Props {
  /** The app's own settings (`app.content`), or nothing when the page only holds added pages. */
  content?: ReactNode;
  /** The app's pages that live here (`under: 'app'`), as rows in their own card under the app's settings. */
  pages?: readonly ExtraPage[];
  /** Opens one of those pages by its id. */
  onOpen: (page: string) => void;
}

/** The App page (Preferences): the app's own settings, then a card with a row for each page that lives here (Data Export, Connect as Family). */
export function AppPage({ content, pages = [], onOpen }: Props) {
  const { theme } = useLook();
  return (
    <View style={STACK}>
      {content}
      {pages.length ? (
        <SettingsGroup>
          {pages.map((p, i) => (
            <SettingRow key={p.id} last={i === pages.length - 1} icon={p.icon} tint={p.tint ?? theme.tints.app} label={p.label} value={p.value} badge={p.badge} onPress={() => onOpen(p.id)} />
          ))}
        </SettingsGroup>
      ) : null}
    </View>
  );
}

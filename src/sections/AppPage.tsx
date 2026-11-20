import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useLook } from '../look';
import type { ExtraPage } from '../types';
import { SettingsGroup, STACK } from '../ui/Group';
import { PageRow } from './AccountPage';

interface Props {
  /** The app's own settings (`app.content`), or nothing when the page only holds added pages. */
  content?: ReactNode;
  /** The app's pages that live here (`under: 'app'`), as rows in cards under the app's settings. */
  pages?: readonly ExtraPage[];
  /** Opens one of those pages by its id. */
  onOpen: (page: string) => void;
}

/** The pages in cards: the untitled one first, then one per `group`, in the order each group first appears. */
export const appGroups = (pages: readonly ExtraPage[]): { title?: string; pages: ExtraPage[] }[] => {
  const groups = new Map<string | undefined, ExtraPage[]>([[undefined, []]]);
  for (const p of pages) {
    const list = groups.get(p.group) ?? [];
    list.push(p);
    groups.set(p.group, list);
  }
  return [...groups].filter(([, list]) => list.length).map(([title, list]) => (title ? { title, pages: list } : { pages: list }));
};

/** The App page (Preferences): the app's own settings, then the cards of pages that live here (Data Export, Connect as Family), each group under its own heading. */
export function AppPage({ content, pages = [], onOpen }: Props) {
  const { theme } = useLook();
  return (
    <View style={STACK}>
      {content}
      {appGroups(pages).map((g) => (
        <SettingsGroup key={g.title ?? ''} title={g.title}>
          {g.pages.map((p, i) => (
            <PageRow key={p.id} page={p} last={i === g.pages.length - 1} tint={p.tint ?? theme.tints.app} onOpen={() => onOpen(p.id)} />
          ))}
        </SettingsGroup>
      ))}
    </View>
  );
}

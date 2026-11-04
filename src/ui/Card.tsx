import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useStyles } from '../context';
import type { AccountTheme } from '../theme';

/** The default card: the theme's fill and edge. An app can replace it (`components.Card`), for example with frosted glass. */
export function PlainCard({ children, radius }: { children: ReactNode; radius: number }) {
  const styles = useStyles(makeStyles);
  return <View style={[styles.card, { borderRadius: radius }]}>{children}</View>;
}

const makeStyles = (t: AccountTheme) => ({
  card: { backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, overflow: 'hidden' as const },
});

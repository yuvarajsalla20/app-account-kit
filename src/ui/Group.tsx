import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useLook, useStyles } from '../context';
import type { AccountTheme } from '../theme';

/** A titled card holding rows. Apps use it too, for their own settings. */
export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  const { components } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.group}>
      {title ? <components.Text style={styles.title}>{title}</components.Text> : null}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  group: { gap: 8 },
  title: { color: t.faint, fontSize: 14, fontWeight: '700' as const },
  card: { borderRadius: t.radius, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, overflow: 'hidden' as const },
});

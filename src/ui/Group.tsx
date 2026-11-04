import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useLook, useStyles } from '../context';
import type { AccountTheme } from '../theme';

/** A titled card holding rows. Apps use it too, for their own settings. */
export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  const { theme, components } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.group}>
      {title ? <components.Text style={styles.title}>{title}</components.Text> : null}
      <components.Card radius={theme.radius}>{children}</components.Card>
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  group: { gap: 8 },
  title: { color: t.faint, fontSize: 14, fontWeight: '700' as const },
});

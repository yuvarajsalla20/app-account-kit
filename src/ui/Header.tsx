import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';
import { useLook, useStyles } from '../look';
import type { AccountTheme } from '../theme';
import { CENTER } from './layout';

/** The default page header: a back arrow and a big title. An app can replace it (`components.Header`) with its own. */
export function PlainHeader({ title, onBack, backLabel }: { title: string; onBack: () => void; backLabel: string }) {
  const { theme, components } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel} hitSlop={10} style={styles.back}>
        <Feather name="chevron-left" size={22} color={theme.accent} />
      </Pressable>
      <components.Text style={styles.title} accessibilityRole="header">{title}</components.Text>
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  wrap: { paddingBottom: 12 },
  back: { width: 36, height: 36, marginLeft: -8, ...CENTER },
  title: { marginTop: 6, color: t.text, fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.8 },
});

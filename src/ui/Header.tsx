import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';
import { useLook, useStyles } from '../look';
import type { AccountTheme } from '../theme';
import { CENTER } from './layout';

interface Props {
  /** Missing on About (the app's name is shown there instead), where the arrow floats beside the content. */
  title?: string;
  onBack: () => void;
  backLabel: string;
  /** The first page: a big title on the left, under the arrow. Every other page centres a smaller title beside the arrow. */
  large?: boolean;
}

/** The top of every page: a back arrow and the page title. The kit draws it, so every app's pages look the same. */
export function PageHeader({ title, onBack, backLabel, large }: Props) {
  const { theme, components, strings } = useLook();
  const styles = useStyles(makeStyles);
  const back = (
    <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel} hitSlop={10} style={large ? styles.backLarge : styles.back}>
      <Feather name="chevron-left" size={24} color={theme.accent} />
      <components.Text style={styles.backText}>{strings.back}</components.Text>
    </Pressable>
  );
  const heading = title ? <components.Text style={large ? styles.large : styles.title} accessibilityRole="header">{title}</components.Text> : null;
  if (large) return <View style={styles.wrapLarge}>{back}{heading}</View>;
  // No title (About): the bar takes no height, so the page's own content starts level with the arrow instead of below an empty row.
  return <View style={heading ? styles.bar : styles.bare}>{back}{heading}</View>;
}

const makeStyles = (t: AccountTheme) => ({
  bar: { height: 44, ...CENTER, marginBottom: 22 },
  bare: { height: 0, zIndex: 1 },
  back: { position: 'absolute' as const, left: -6, top: 0, height: 44, flexDirection: 'row' as const, alignItems: 'center' as const, paddingRight: 10 },
  backText: { color: t.accent, fontSize: 16, fontWeight: '500' as const },
  title: { color: t.text, fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.2 },
  wrapLarge: { paddingBottom: 12 },
  backLarge: { height: 44, marginLeft: -6, flexDirection: 'row' as const, alignItems: 'center' as const, paddingRight: 10 },
  large: { marginTop: 6, color: t.text, fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.8 },
});

import Feather from '@expo/vector-icons/Feather';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useLook, useStyles } from '../look';
import type { AccountTheme } from '../theme';
import { CENTER } from './layout';

interface Props {
  /** Missing on About (the app's name is shown there instead), where the arrow floats beside the content. */
  title?: string;
  onBack: () => void;
  backLabel: string;
  /** The first page: a big title on the left. Every other page has a smaller title. */
  large?: boolean;
  /** The app's logo and name. With it the top row is Back on the left and the brand centred, and the title sits under it on the left. */
  brand?: ReactNode;
}

/** The top of every page: a small Back button and the page title. The kit draws it, so every app's pages look the same. */
export function PageHeader({ title, onBack, backLabel, large, brand }: Props) {
  const { theme, components, strings } = useLook();
  const styles = useStyles(makeStyles);
  const back = (
    <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel} hitSlop={10} style={styles.back}>
      <Feather name="chevron-left" size={20} color={theme.accent} />
      <components.Text style={styles.backText}>{strings.back}</components.Text>
    </Pressable>
  );
  const heading = title ? <components.Text style={large ? styles.large : brand ? styles.under : styles.title} accessibilityRole="header">{title}</components.Text> : null;
  // No title (About): the bar takes no height, so the page's own content starts level with the arrow instead of below an empty row.
  if (!heading) return <View style={styles.bare}>{back}</View>;
  if (brand) {
    return (
      <View style={styles.wrapBrand}>
        <View style={styles.brandRow}>{back}{brand}</View>
        {heading}
      </View>
    );
  }
  if (large) return <View style={styles.wrapLarge}><View style={styles.largeBack}>{back}</View>{heading}</View>;
  return <View style={styles.bar}>{back}{heading}</View>;
}

const makeStyles = (t: AccountTheme) => ({
  bar: { height: 44, ...CENTER, marginBottom: 22 },
  bare: { height: 0, zIndex: 1 },
  back: { position: 'absolute' as const, left: -6, top: -2, height: 44, flexDirection: 'row' as const, alignItems: 'center' as const, paddingRight: 10, zIndex: 1 },
  backText: { color: t.accent, fontSize: 14, fontWeight: '500' as const },
  title: { color: t.text, fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.2 },
  wrapBrand: { marginBottom: 14 },
  brandRow: { height: 40, ...CENTER },
  under: { marginTop: 8, color: t.text, fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4 },
  wrapLarge: { paddingBottom: 12 },
  largeBack: { height: 40 },
  large: { marginTop: 8, color: t.text, fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.8 },
});

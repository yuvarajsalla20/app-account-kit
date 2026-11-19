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
  /** Optional (7.17.0): round buttons on the right of the top row, such as Account's ⋯. */
  right?: ReactNode;
  /** Opt-in (7.19.0): Back and the title in one row, the title on the left beside Back. Used instead of `brand`. */
  inline?: boolean;
}

/** The top of every page: a small Back button and the page title. The kit draws it, so every app's pages look the same. */
export function PageHeader({ title, onBack, backLabel, large, brand, right, inline }: Props) {
  const { theme, components, strings } = useLook();
  const styles = useStyles(makeStyles);
  const place = (brand || inline) && title ? styles.backInRow : styles.back;
  // The app's own Back, when it passes one, sits where the kit's would, so every page of the app has the same Back.
  const back = components.BackButton ? (
    <View style={[place, styles.ownBack]}>
      <components.BackButton onPress={onBack} label={backLabel} />
    </View>
  ) : (
    <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel} hitSlop={10} style={place}>
      <Feather name="chevron-left" size={20} color={theme.accent} />
      <components.Text style={styles.backText}>{strings.back}</components.Text>
    </Pressable>
  );
  const side = right ? <View style={styles.right}>{right}</View> : null;
  const heading = title ? <components.Text style={large ? styles.large : brand ? styles.under : styles.title} accessibilityRole="header">{title}</components.Text> : null;
  // No title (About): the bar takes no height, so the page's own content starts level with the arrow instead of below an empty row.
  if (!heading) return <View style={styles.bare}>{back}</View>;
  if (inline) {
    return (
      <View style={styles.inlineRow}>
        {back}
        <components.Text style={styles.inlineTitle} numberOfLines={1} accessibilityRole="header">{title}</components.Text>
        {side}
      </View>
    );
  }
  if (brand) {
    return (
      <View style={styles.wrapBrand}>
        <View style={styles.brandRow}>{brand}<View style={styles.brandBack}>{back}</View>{side}</View>
        {heading}
      </View>
    );
  }
  if (large) return <View style={styles.wrapLarge}><View style={styles.largeBack}>{back}{side}</View>{heading}</View>;
  return <View style={styles.bar}>{back}{heading}{side}</View>;
}

const makeStyles = (t: AccountTheme) => ({
  bar: { height: 44, ...CENTER, marginBottom: 22 },
  bare: { height: 0, zIndex: 1 },
  back: { position: 'absolute' as const, left: -6, top: -2, height: 44, flexDirection: 'row' as const, alignItems: 'center' as const, paddingRight: 10, zIndex: 1 },
  // The app's Back brings its own size and padding; no extra gap or nudge from the kit's arrow layout.
  ownBack: { height: undefined, minHeight: 44, paddingRight: 0, marginLeft: 0, left: 0 },
  backText: { color: t.accent, fontSize: t.backSize ?? 14, fontWeight: (t.backSize ? '700' : '500') as '700' | '500' },
  title: { color: t.text, fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.2 },
  wrapBrand: { marginBottom: 14 },
  // The brand sets the row's height (a tall logo is never cut off); Back sits on the left, centred on it.
  brandRow: { minHeight: 40, ...CENTER },
  backInRow: { height: 44, flexDirection: 'row' as const, alignItems: 'center' as const, paddingRight: 10, marginLeft: -6 },
  brandBack: { position: 'absolute' as const, left: 0, top: 0, bottom: 0, justifyContent: 'center' as const, zIndex: 1 },
  // Above the page below it, so a menu that opens under the button is not hidden by the first card.
  right: { position: 'absolute' as const, right: 0, top: 0, bottom: 0, justifyContent: 'center' as const, zIndex: 20, elevation: 20 },
  // 7.19.0 plain header: Back, then the title on the left, in one row.
  inlineRow: { minHeight: 44, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, marginBottom: 14 },
  inlineTitle: { flexShrink: 1, color: t.text, fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2 },
  under: { marginTop: 8, color: t.text, fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4 },
  wrapLarge: { paddingBottom: 12 },
  largeBack: { height: 40 },
  large: { marginTop: 8, color: t.text, fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.8 },
});

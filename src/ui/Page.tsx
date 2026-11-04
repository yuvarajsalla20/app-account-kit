import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useLook, useStyles } from '../context';
import type { AccountTheme } from '../theme';

interface Props {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

/** A page inside the Account screen: a back arrow and a title, then the content. */
export function Page({ title, onBack, children }: Props) {
  const { theme, strings, components } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.page}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={strings.back} hitSlop={10} style={styles.back}>
        <Feather name="chevron-left" size={22} color={theme.text} />
        <components.Text style={styles.title}>{title}</components.Text>
      </Pressable>
      {children}
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  page: { gap: 16 },
  back: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4, alignSelf: 'flex-start' as const },
  title: { color: t.text, fontSize: 20, fontWeight: '700' as const },
});

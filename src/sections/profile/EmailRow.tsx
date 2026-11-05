import { View } from 'react-native';
import { useLook, useStyles } from '../../look';
import type { AccountTheme } from '../../theme';

interface Props {
  email: string;
  /** The last row in a card has no line under it. */
  last?: boolean;
}

/** The sign-in email, read only, laid out like the nickname row: a small label with the value under it. */
export function EmailRow({ email, last }: Props) {
  const { strings, components } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.row, !last && styles.line]} accessible accessibilityLabel={`${strings.email}, ${email}`}>
      <components.Text style={styles.label}>{strings.email}</components.Text>
      <components.Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">{email}</components.Text>
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  row: { padding: 14 },
  line: { borderBottomWidth: 1, borderBottomColor: t.line },
  label: { color: t.muted, fontSize: 13, fontWeight: '600' as const, marginBottom: 6, marginLeft: 2 },
  value: { color: t.text, fontSize: 16, marginLeft: 2 },
});

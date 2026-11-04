import type { ComponentProps } from 'react';
import { View, type TextInput } from 'react-native';
import { useLook, useStyles } from '../look';
import type { AccountTheme } from '../theme';

type Props = { label?: string } & Omit<ComponentProps<typeof TextInput>, 'style'>;

/** A labelled text box: the nickname and the password to confirm a delete. */
export function Field({ label, ...input }: Props) {
  const { theme, components } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <View>
      {label ? <components.Text style={styles.label}>{label}</components.Text> : null}
      <components.TextInput accessibilityLabel={label} placeholderTextColor={theme.faint} selectionColor={theme.accent} {...input} style={styles.input} />
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  label: { color: t.muted, fontSize: 13, fontWeight: '600' as const, marginBottom: 6, marginLeft: 2 },
  input: { minHeight: 50, paddingVertical: 10, borderRadius: 14, backgroundColor: t.field, borderWidth: 1, borderColor: t.border, paddingHorizontal: 14, color: t.text, fontSize: 16, fontWeight: '600' as const },
});

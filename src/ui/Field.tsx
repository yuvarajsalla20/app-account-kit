import { forwardRef, type ComponentProps, type ElementRef } from 'react';
import { View, type TextInput } from 'react-native';
import { useLook, useStyles } from '../look';
import type { AccountTheme } from '../theme';

/** What `ref` gives: the text box itself (call `focus()` on it). */
export type InputRef = ElementRef<typeof TextInput>;
type Props = { label?: string } & Omit<ComponentProps<typeof TextInput>, 'style' | 'ref'>;

/** A labelled text box: the nickname and the password boxes. The ref reaches the text box, so one box can hand focus to the next. */
export const Field = forwardRef<InputRef, Props>(function Field({ label, ...input }, ref) {
  const { theme, components } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <View>
      {label ? <components.Text style={styles.label}>{label}</components.Text> : null}
      <components.TextInput ref={ref} accessibilityLabel={label} placeholderTextColor={theme.faint} selectionColor={theme.accent} {...input} style={styles.input} />
    </View>
  );
});

const makeStyles = (t: AccountTheme) => ({
  label: { color: t.muted, fontSize: 13, fontWeight: '600' as const, marginBottom: 6, marginLeft: 2 },
  input: { minHeight: 50, paddingVertical: 10, borderRadius: 14, backgroundColor: t.field, borderWidth: 1, borderColor: t.border, paddingHorizontal: 14, color: t.text, fontSize: 16, fontWeight: '600' as const },
});

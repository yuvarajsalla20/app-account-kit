import Feather from '@expo/vector-icons/Feather';
import { ActivityIndicator, Pressable } from 'react-native';
import { useLook, useStyles } from '../look';
import type { AccountTheme } from '../theme';
import type { IconName } from '../types';
import { CENTER } from './layout';

interface Props {
  label: string;
  onPress: () => void;
  /** solid: the main button. quiet: an outlined button. danger: red text on a quiet button. outline: red text and red edge, no fill, for a rare, serious action. line: text color and a thin edge in the text color, no fill (Sign out). */
  variant?: 'solid' | 'quiet' | 'danger' | 'outline' | 'line';
  icon?: IconName;
  /** Half-height, for secondary actions. */
  small?: boolean;
  busy?: boolean;
  disabled?: boolean;
  /** Fill the row next to another button. */
  grow?: boolean;
}

/** The one button the Settings screen uses: Send link, Sign out, Delete account, Delete everything. */
export function Button({ label, onPress, variant = 'quiet', icon, small, busy, disabled, grow }: Props) {
  const { theme, components } = useLook();
  const styles = useStyles(makeStyles);
  const color = variant === 'solid' ? theme.ink : variant === 'danger' || variant === 'outline' ? theme.danger : theme.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }}
      style={({ pressed }) => [styles.button, small && styles.small, variant === 'solid' ? styles.solid : variant === 'outline' ? styles.outline : variant === 'line' ? styles.line : styles.quiet, grow && styles.grow, pressed && styles.pressed, disabled && styles.off]}
    >
      {busy ? <ActivityIndicator color={color} /> : icon ? <Feather name={icon} size={small ? 17 : 18} color={color} /> : null}
      {busy ? null : <components.Text style={[styles.label, { color }]}>{label}</components.Text>}
    </Pressable>
  );
}

const makeStyles = (t: AccountTheme) => ({
  button: { flexDirection: 'row' as const, ...CENTER, gap: 8, minHeight: 52, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16 },
  small: { minHeight: 46, paddingVertical: 10, borderRadius: 14 },
  solid: { backgroundColor: t.accent },
  quiet: { backgroundColor: t.field, borderWidth: 1, borderColor: t.border },
  outline: { borderWidth: 1, borderColor: t.danger },
  line: { borderWidth: 1, borderColor: t.text },
  grow: { flex: 1 },
  pressed: { opacity: 0.8 },
  off: { opacity: 0.4 },
  label: { fontSize: 15, fontWeight: '700' as const },
});

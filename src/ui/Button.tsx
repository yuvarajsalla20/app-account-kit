import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable } from 'react-native';
import { useLook, useStyles } from '../context';
import type { AccountTheme } from '../theme';
import type { IconName } from '../types';

interface Props {
  label: string;
  onPress: () => void;
  /** solid: the main button. quiet: an outlined button. danger: red text on a quiet button. */
  variant?: 'solid' | 'quiet' | 'danger';
  icon?: IconName;
  /** Half-height, for secondary actions. */
  small?: boolean;
  busy?: boolean;
  disabled?: boolean;
  /** Fill the row next to another button. */
  grow?: boolean;
}

/** The one button the Account screen uses: Send link, Sign out, Delete account, Delete everything. */
export function Button({ label, onPress, variant = 'quiet', icon, small, busy, disabled, grow }: Props) {
  const { theme, components } = useLook();
  const styles = useStyles(makeStyles);
  const color = variant === 'solid' ? theme.ink : variant === 'danger' ? theme.danger : theme.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || busy) }}
      style={({ pressed }) => [styles.button, small && styles.small, variant === 'solid' ? styles.solid : styles.quiet, grow && styles.grow, pressed && styles.pressed, disabled && styles.off]}
    >
      {busy ? <ActivityIndicator color={color} /> : icon ? <Feather name={icon} size={small ? 17 : 18} color={color} /> : null}
      {busy ? null : <components.Text style={[styles.label, { color }]}>{label}</components.Text>}
    </Pressable>
  );
}

const makeStyles = (t: AccountTheme) => ({
  button: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 8, height: 52, borderRadius: 16 },
  small: { height: 46, borderRadius: 14 },
  solid: { backgroundColor: t.accent },
  quiet: { backgroundColor: t.field, borderWidth: 1, borderColor: t.border },
  grow: { flex: 1 },
  pressed: { opacity: 0.8 },
  off: { opacity: 0.4 },
  label: { fontSize: 15, fontWeight: '700' as const },
});

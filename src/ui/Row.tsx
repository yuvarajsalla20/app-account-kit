import Feather from '@expo/vector-icons/Feather';
import type { ReactNode } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { useLook, useStyles } from '../look';
import type { AccountTheme } from '../theme';
import type { IconName } from '../types';
import { CENTER, ROW_CENTER } from './layout';

interface Props {
  icon: IconName;
  /** The color of the icon tile, so each kind of setting is easy to spot. */
  tint: string;
  label: string;
  /** A second, smaller line under the label. */
  detail?: string;
  /** A short value on the right. */
  value?: string;
  onPress?: () => void;
  /** Shows an on/off switch instead of an arrow. */
  toggle?: { value: boolean; onChange: (value: boolean) => void };
  /** Extra content under the row, such as a list that opened. */
  children?: ReactNode;
  /** The last row in a card has no line under it. */
  last?: boolean;
  disabled?: boolean;
}

/** One setting row: a colored icon tile, a label, an optional value, and an arrow or a switch. Apps use it too. */
export function SettingRow({ icon, tint, label, detail, value, onPress, toggle, children, last, disabled }: Props) {
  const { theme, components } = useLook();
  const styles = useStyles(makeStyles);
  const press = toggle ? () => toggle.onChange(!toggle.value) : onPress;
  return (
    <View style={!last && styles.line}>
      <Pressable
        onPress={press}
        disabled={!press || disabled}
        accessibilityRole={toggle ? 'switch' : press ? 'button' : undefined}
        accessibilityLabel={detail ? `${label}, ${detail}` : label}
        accessibilityValue={value ? { text: value } : undefined}
        accessibilityState={{ disabled: !!disabled, ...(toggle ? { checked: toggle.value } : null), ...(children ? { expanded: true } : null) }}
        style={styles.row}
      >
        <View style={[styles.tile, { backgroundColor: `${tint}33` }]}>
          <Feather name={icon} size={18} color={tint} />
        </View>
        <View style={styles.grow}>
          <components.Text style={styles.label}>{label}</components.Text>
          {detail ? <components.Text style={styles.detail}>{detail}</components.Text> : null}
        </View>
        {value ? <components.Text style={styles.value} numberOfLines={2}>{value}</components.Text> : null}
        {toggle ? (
          <Switch value={toggle.value} onValueChange={toggle.onChange} trackColor={{ true: theme.on, false: theme.field }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
        ) : onPress ? (
          <Feather name="chevron-right" size={18} color={theme.faint} />
        ) : null}
      </Pressable>
      {children ? <View style={styles.extra}>{children}</View> : null}
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  line: { borderBottomWidth: 1, borderBottomColor: t.line },
  row: { ...ROW_CENTER, gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  tile: { width: 34, height: 34, borderRadius: 11, ...CENTER },
  grow: { flex: 1 },
  label: { color: t.text, fontSize: 16, fontWeight: '600' as const },
  detail: { color: t.muted, fontSize: 12, marginTop: 2 },
  value: { color: t.muted, fontSize: 15, flexShrink: 1, maxWidth: '65%' as const, textAlign: 'right' as const },
  extra: { paddingHorizontal: 14, paddingBottom: 14 },
});

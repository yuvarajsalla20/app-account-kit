import Feather from '@expo/vector-icons/Feather';
import type { ReactNode } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { useLook, useStyles } from '../look';
import type { AccountTheme } from '../theme';
import type { IconName } from '../types';
import { CENTER, ROW_CENTER } from './layout';
import { PremiumLock, PremiumTag } from './PremiumTag';
import { UpDown } from './PullDown';
import { usePlanMode } from '../planMode';

interface Props {
  icon: IconName;
  /** The color of the icon tile, so each kind of setting is easy to spot. */
  tint: string;
  label: string;
  /** A second, smaller line under the label. */
  detail?: string;
  /** A short value on the right. */
  value?: string;
  /** Drawn in place of the value on the right, such as a small pill. Screen readers hear `value`. */
  badge?: ReactNode;
  onPress?: () => void;
  /** Shows an on/off switch instead of an arrow. */
  toggle?: { value: boolean; onChange: (value: boolean) => void };
  /** A row that opens a web page: a slanted arrow instead of the usual one. */
  external?: boolean;
  /** Set on a row that opens in place: the arrow turns down while it is open, and screen readers hear it. */
  expanded?: boolean;
  /** Extra content under the row, such as a list that opened. */
  children?: ReactNode;
  /** The last row in a card has no line under it. */
  last?: boolean;
  disabled?: boolean;
  /** Locked (Premium): a padlock on a soft circle (`theme.lock`) in place of the arrow, and screen readers hear `strings.lockedHint`. A tap still calls `onPress` (open the plans). */
  locked?: boolean;
  /** An icon in place of the usual arrow, such as "download" on a row that makes a file. */
  trailing?: IconName;
  /** 7.24.0: a row that cannot be undone, such as Delete account: the label is drawn in `danger`. */
  danger?: boolean;
  /** 7.26.0: the row opens a pull-down menu in place: a small up/down chevron instead of the arrow, or nothing beside a `badge` (the pill carries it). */
  opensMenu?: boolean;
  /**
   * 7.34.0: a Premium feature. The gold Premium tag sits right after the label, for every account, and a `locked` row shows the
   * padlock in the same gold. Screen readers hear "Premium" after the label. 10.0.0: while the plan mode is `'free'`, the row is
   * not drawn at all.
   */
  premium?: boolean;
}

/** One setting row: a colored icon tile, a label, an optional value, and an arrow or a switch. Apps use it too. */
export function SettingRow({ icon, tint, label, detail, value, badge, onPress, toggle, external, expanded, children, last, disabled, locked, trailing, danger, opensMenu, premium: premiumIn }: Props) {
  const { theme, strings, components } = useLook();
  const styles = useStyles(makeStyles);
  // 10.0.0: with nothing on sale (plan mode 'free'), a Premium feature is not shown at all.
  const offered = usePlanMode() === 'subscription';
  const premium = offered && premiumIn;
  const press = toggle ? () => toggle.onChange(!toggle.value) : onPress;
  if (premiumIn && !offered) return null;
  return (
    <View style={!last && styles.line}>
      <Pressable
        onPress={press}
        disabled={!press || disabled}
        accessibilityRole={toggle ? 'switch' : press ? 'button' : undefined}
        accessibilityLabel={[label, premium ? strings.premiumTag : undefined, detail, locked ? strings.lockedHint : undefined].filter(Boolean).join(', ')}
        accessibilityValue={value ? { text: value } : undefined}
        accessibilityState={{ disabled: !!disabled, ...(toggle ? { checked: toggle.value } : null), ...(expanded === undefined ? null : { expanded }) }}
        style={styles.row}
      >
        <View style={[styles.tile, { backgroundColor: `${tint}33` }]}>
          <Feather name={icon} size={18} color={tint} />
        </View>
        <View style={styles.grow}>
          {premium ? (
            <View style={styles.named}>
              <components.Text style={[styles.label, styles.shrink, danger && { color: theme.danger }]} numberOfLines={1}>{label}</components.Text>
              <PremiumTag />
            </View>
          ) : <components.Text style={[styles.label, danger && { color: theme.danger }]}>{label}</components.Text>}
          {detail ? <components.Text style={styles.detail}>{detail}</components.Text> : null}
        </View>
        {badge ? (
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{badge}</View>
        ) : value ? <components.Text style={styles.value} numberOfLines={2}>{value}</components.Text> : null}
        {locked && premium ? (
          <PremiumLock />
        ) : locked ? (
          <View style={styles.lock}>
            <Feather name="lock" size={17} color={theme.lock?.icon ?? theme.muted} />
          </View>
        ) : toggle ? (
          <Switch value={toggle.value} onValueChange={toggle.onChange} trackColor={{ true: theme.on, false: theme.field }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
        ) : onPress && opensMenu ? (
          badge ? null : <UpDown color={theme.faint} />
        ) : onPress && trailing ? (
          <Feather name={trailing} size={18} color={theme.muted} />
        ) : onPress ? (
          <Feather name={external ? 'arrow-up-right' : expanded ? 'chevron-down' : 'chevron-right'} size={18} color={theme.faint} />
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
  named: { ...ROW_CENTER, gap: 8 },
  shrink: { flexShrink: 1 },
  label: { color: t.text, fontSize: 16, fontWeight: '600' as const },
  detail: { color: t.muted, fontSize: 12, marginTop: 2 },
  value: { color: t.muted, fontSize: 15, flexShrink: 1, maxWidth: '65%' as const, textAlign: 'right' as const },
  extra: { paddingHorizontal: 14, paddingBottom: 14 },
  lock: { width: 30, height: 30, borderRadius: 15, backgroundColor: t.lock?.circle ?? t.field, ...CENTER },
});

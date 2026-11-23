import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { useLook } from '../look';
import type { AccountTheme } from '../theme';
import { withAlpha } from './color';
import { usePlanMode } from '../planMode';
import { ROW_CENTER } from './layout';

/** 7.34.0: the gold of every Premium mark: `theme.premium`, else `tints.rate` (the comparison table's gold). */
export const premiumGold = (t: AccountTheme): string => t.premium ?? t.tints.rate;

/**
 * 7.34.0: the small gold tag beside the name of a Premium feature, such as Data Export or Workspace: the award mark of the plan
 * page's Free and Premium comparison and the word "PREMIUM" in `ink` on solid gold, as on the approved mock. Shown to every account,
 * free and paid alike, so the person always knows which features the plan includes. Screen readers hear it from the row
 * (`SettingRow` adds `strings.premiumTag` to its label), so the tag itself is hidden from them. 9.0.0: drawn only while the plan
 * mode is `'subscription'`; with nothing on sale (`'free'`, the default) every feature is open and no tag shows.
 */
export function PremiumTag() {
  const { theme, strings, components } = useLook();
  const mode = usePlanMode();
  if (mode !== 'subscription') return null;
  const gold = premiumGold(theme);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ ...ROW_CENTER, gap: 3, height: 20, paddingLeft: 6, paddingRight: 7, borderRadius: 10, backgroundColor: gold, flexShrink: 0 }}
    >
      <Feather name="award" size={11} color={theme.ink} />
      <components.Text style={{ color: theme.ink, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>{strings.premiumTag.toUpperCase()}</components.Text>
    </View>
  );
}

/** 7.34.0: the padlock circle on a locked Premium row, in the Premium gold. 9.0.0: none while the plan mode is `'free'`. */
export function PremiumLock({ size = 30 }: { size?: number }) {
  const { theme } = useLook();
  const mode = usePlanMode();
  if (mode !== 'subscription') return null;
  const gold = premiumGold(theme);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no" style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: withAlpha(gold, 0.16) ?? theme.lock?.circle ?? theme.field }}>
      <Feather name="lock" size={Math.round(size * 0.55)} color={gold} />
    </View>
  );
}

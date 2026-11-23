import Feather from '@expo/vector-icons/Feather';
import { useRef, useState, type ElementRef, type ReactNode } from 'react';
import { Modal, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { placeMenu, type Box } from '../logic/menuPlace';
import { useLook, useStyles } from '../look';
import type { AccountTheme } from '../theme';
import type { IconName } from '../types';
import { useAfterClose } from './afterClose';
import { ROW_CENTER } from './layout';
import { MENU_BLUR, menuFill, withAlpha } from './color';
import { offeredOptions, usePremiumOffered } from '../planMode';

/** One line of a pull-down menu (7.26.0). */
export interface PullDownItem {
  id: string;
  label: string;
  /** A short muted word on the right, such as a currency symbol. */
  detail?: string;
  /** A small icon on the right. */
  icon?: IconName;
  /** Drawn in the danger color, such as Log Out. */
  danger?: boolean;
  /** The chosen line: a tick on its left. */
  checked?: boolean;
  /** 7.32.0: a small icon before the label, as in the iOS menus. */
  lead?: IconName;
  /** 7.32.0: a small color dot before the label, such as a workspace or type color. Takes the place of `lead`. */
  dot?: string;
  /**
   * 7.32.0: needs the paid plan: a padlock on the right in the theme's lock colors. The line can still be picked; the app decides
   * what a pick does. 10.0.0: while the plan mode is `'free'`, the line is left out, unless it is the `checked` one, which then
   * shows without a padlock.
   */
  locked?: boolean;
  /** 7.32.0: starts a new group: a thin line and a little space above it. */
  group?: boolean;
}

interface MenuProps {
  /** Where the row that opened it sits on screen, or null when it could not be measured (the menu then sits mid-screen). */
  anchor: Box | null;
  /** A short muted line at the top, such as what Log Out keeps. */
  head?: string;
  items: readonly PullDownItem[];
  /** A tap on a line. Called once the menu has finished closing (7.29.0), so it can open a share sheet on iPhone. */
  onPick: (id: string) => void;
  onClose: () => void;
  /**
   * 7.29.0: keep the menu mounted and pass `open` here, so it can fade out before `onPick` runs. Default true (a menu that is
   * taken away on close still works; `onPick` then waits a moment instead).
   */
  visible?: boolean;
}

const MENU_WIDTH = 250;
const ITEM_HEIGHT = 44;
/** Room the menu leaves above and below it on the screen; a longer list scrolls inside it. */
const SCREEN_MARGIN = 120;
const PAD = 8;
const GROUP_GAP = 9;


/**
 * The iOS-style pull-down menu (7.26.0; glass look 7.32.0; frosted 8.0.0): a well-rounded card with a thin outline that opens
 * over the row that opened it, with a tick on the chosen line and, optionally, an icon or color dot before each label. The kit
 * sets its fill: on iPhone, `components.MenuBackdrop` draws a strong frosted blur and the card color lies over it at 92%, so
 * the rows beneath never show through the words; on Android, and without a backdrop, the card color is solid. A tap on a line
 * closes the menu and then picks it; a tap anywhere else only closes.
 */
export function PullDownMenu({ anchor, head, items: given, onPick, onClose, visible = true }: MenuProps) {
  const { theme, strings, components } = useLook();
  const offered = usePremiumOffered();
  const items = offered ? given : offeredOptions(given, false, (it) => !!it.locked, (it) => !!it.checked).map((it) => (it.locked ? { ...it, locked: false, group: false } : it));
  const styles = useStyles(makeStyles);
  const screen = useWindowDimensions();
  const maxHeight = Math.max(ITEM_HEIGHT * 3, screen.height - SCREEN_MARGIN);
  const groups = items.filter((it, i) => i > 0 && it.group).length;
  const height = Math.min(maxHeight, items.length * ITEM_HEIGHT + groups * GROUP_GAP + (head ? 52 : 0) + PAD * 2);
  const spot = placeMenu(anchor, { width: MENU_WIDTH, height }, screen);
  const after = useAfterClose();
  // Android draws no true blur behind a view, so the menu there is solid and the backdrop is left out.
  const Backdrop = Platform.OS === 'ios' ? components.MenuBackdrop : undefined;
  const lock = theme.lock ?? { icon: theme.muted, circle: theme.field };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onDismiss={after.onDismiss} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel={strings.close} />
      <View style={[styles.shadow, { top: spot.top, left: spot.left, width: MENU_WIDTH, maxHeight }]}>
        <View style={[styles.menu, { maxHeight }]} accessibilityViewIsModal accessibilityRole="menu">
          {Backdrop ? <Backdrop style={styles.fill} intensity={MENU_BLUR} /> : null}
          <View style={[styles.fill, { backgroundColor: menuFill(theme.surface, theme.panel, !!Backdrop) }]} />
          {head ? <components.Text style={styles.head}>{head}</components.Text> : null}
          <ScrollView bounces={false} contentContainerStyle={styles.list}>
            {items.map((item, i) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  onClose();
                  after.later(() => onPick(item.id));
                }}
                accessibilityRole="menuitem"
                accessibilityLabel={[item.label, item.detail, item.locked ? strings.lockedHint : undefined].filter(Boolean).join(', ')}
                accessibilityState={{ selected: !!item.checked }}
                style={({ pressed }) => [styles.item, i > 0 && item.group && styles.group, pressed && styles.pressed]}
              >
                <View style={styles.tick}>{item.checked ? <Feather name="check" size={16} color={theme.text} /> : null}</View>
                {item.dot ? (
                  <View style={styles.leadBox}>
                    <View style={[styles.dot, { backgroundColor: item.dot }]} />
                  </View>
                ) : item.lead ? (
                  <View style={styles.leadBox}>
                    <Feather name={item.lead} size={17} color={item.danger ? theme.danger : theme.text} />
                  </View>
                ) : null}
                <components.Text style={[styles.label, item.checked && styles.chosen, item.danger && { color: theme.danger }]} numberOfLines={1}>{item.label}</components.Text>
                {item.detail ? <components.Text style={styles.detail}>{item.detail}</components.Text> : null}
                {item.icon ? <Feather name={item.icon} size={17} color={item.danger ? theme.danger : theme.muted} /> : null}
                {item.locked ? (
                  <View style={[styles.lock, { backgroundColor: lock.circle }]}>
                    <Feather name="lock" size={12} color={lock.icon} />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/** The grey pill on a row: the current value and a small up/down chevron, like iOS Settings. */
export function PullDownPill({ value }: { value: string }) {
  const { theme, components } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.pill}>
      <components.Text style={styles.pillText} numberOfLines={1}>{value}</components.Text>
      <UpDown color={theme.muted} />
    </View>
  );
}

/** The small up/down chevron that says "opens a menu". */
export function UpDown({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Feather name="chevron-up" size={11} color={color} style={{ marginBottom: -4 }} />
      <Feather name="chevron-down" size={11} color={color} />
    </View>
  );
}

/** Measures a view when asked, so a menu can float next to it. */
export function useAnchor() {
  const ref = useRef<ElementRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<Box | null>(null);
  const [open, setOpen] = useState(false);
  // 7.29.0: true once the menu has opened, so it can stay mounted and fade out (render `<PullDownMenu visible={open} />` while `opened`).
  const [opened, setOpened] = useState(false);
  const reveal = () => {
    setOpened(true);
    setOpen(true);
  };
  const show = () => {
    const node = ref.current as unknown as { measureInWindow?: (cb: (x: number, y: number, width: number, height: number) => void) => void } | null;
    if (node?.measureInWindow) {
      node.measureInWindow((x, y, width, height) => {
        setAnchor({ x, y, width, height });
        reveal();
      });
    } else {
      setAnchor(null);
      reveal();
    }
  };
  return { ref, anchor, open, opened, show, hide: () => setOpen(false) };
}

/** A row that opens a pull-down menu in place (7.26.0): with `pill`, the grey value pill on the right; without, the small up/down chevron. */
export function MenuRow({ pill, head, items, onPick, children }: { pill?: string; head?: string; items: readonly PullDownItem[]; onPick: (id: string) => void; children: (open: () => void, badge: ReactNode) => ReactNode }) {
  const a = useAnchor();
  return (
    <View ref={a.ref} collapsable={false}>
      {children(a.show, pill !== undefined ? <PullDownPill value={pill} /> : null)}
      {/* Kept mounted once opened, so it fades out before onPick runs (7.29.0). */}
      {a.opened ? <PullDownMenu visible={a.open} anchor={a.anchor} head={head} items={items} onPick={onPick} onClose={a.hide} /> : null}
    </View>
  );
}

const MENU_RADIUS = 28;

const makeStyles = (t: AccountTheme) => ({
  scrim: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' },
  // The shadow sits on an outer view: iOS drops the shadow of a view that clips its children.
  shadow: {
    position: 'absolute' as const,
    borderRadius: MENU_RADIUS,
    shadowColor: t.scrim,
    shadowOpacity: 0.26,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 16,
  },
  // 8.0.0: the fill is its own layer over the backdrop (see `menuFill`), so `theme.menu` no longer reaches the menu.
  menu: {
    borderRadius: MENU_RADIUS,
    borderWidth: 0.75,
    borderColor: t.menuEdge ?? withAlpha(t.text, 0.55) ?? t.border,
    overflow: 'hidden' as const,
  },
  fill: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 },
  list: { paddingVertical: PAD },
  head: { color: t.muted, fontSize: 13, lineHeight: 18, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: t.line },
  item: { ...ROW_CENTER, gap: 8, minHeight: ITEM_HEIGHT, paddingLeft: 10, paddingRight: 16 },
  group: { marginTop: GROUP_GAP, borderTopWidth: 1, borderTopColor: t.line },
  pressed: { backgroundColor: t.field },
  tick: { width: 20, alignItems: 'center' as const },
  leadBox: { width: 22, alignItems: 'center' as const, marginRight: 2 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  lock: { width: 24, height: 24, borderRadius: 12, alignItems: 'center' as const, justifyContent: 'center' as const },
  label: { flex: 1, color: t.text, fontSize: 16 },
  chosen: { fontWeight: '600' as const },
  detail: { color: t.muted, fontSize: 14 },
  pill: { ...ROW_CENTER, gap: 6, paddingVertical: 6, paddingLeft: 12, paddingRight: 10, borderRadius: 999, backgroundColor: t.field, maxWidth: 180 },
  pillText: { color: t.text, fontSize: 15, fontWeight: '500' as const, flexShrink: 1 },
});

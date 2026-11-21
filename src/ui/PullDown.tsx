import Feather from '@expo/vector-icons/Feather';
import { useRef, useState, type ElementRef, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { placeMenu, type Box } from '../logic/menuPlace';
import { useLook, useStyles } from '../look';
import type { AccountTheme } from '../theme';
import type { IconName } from '../types';
import { useAfterClose } from './afterClose';
import { ROW_CENTER } from './layout';

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
const ITEM_HEIGHT = 46;
const MAX_HEIGHT = 380;

/**
 * The iOS-style pull-down menu (7.26.0): a small rounded card that floats right under (or, near the bottom, right above) the row
 * that opened it, with a tick on the chosen line. A tap on a line closes the menu and then picks it; a tap anywhere else only closes.
 */
export function PullDownMenu({ anchor, head, items, onPick, onClose, visible = true }: MenuProps) {
  const { theme, strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const screen = useWindowDimensions();
  const height = Math.min(MAX_HEIGHT, items.length * ITEM_HEIGHT + (head ? 52 : 0) + 8);
  const spot = placeMenu(anchor, { width: MENU_WIDTH, height }, screen);
  const after = useAfterClose();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onDismiss={after.onDismiss} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel={strings.close} />
      <View style={[styles.menu, { top: spot.top, left: spot.left, width: MENU_WIDTH, maxHeight: MAX_HEIGHT }]} accessibilityViewIsModal accessibilityRole="menu">
        {head ? <components.Text style={styles.head}>{head}</components.Text> : null}
        <ScrollView bounces={false}>
          {items.map((item, i) => (
            <Pressable
              key={item.id}
              onPress={() => {
                onClose();
                after.later(() => onPick(item.id));
              }}
              accessibilityRole="menuitem"
              accessibilityLabel={item.detail ? `${item.label}, ${item.detail}` : item.label}
              accessibilityState={{ selected: !!item.checked }}
              style={({ pressed }) => [styles.item, i > 0 && styles.line, pressed && styles.pressed]}
            >
              <View style={styles.tick}>{item.checked ? <Feather name="check" size={16} color={theme.text} /> : null}</View>
              <components.Text style={[styles.label, item.danger && { color: theme.danger }]} numberOfLines={1}>{item.label}</components.Text>
              {item.detail ? <components.Text style={styles.detail}>{item.detail}</components.Text> : null}
              {item.icon ? <Feather name={item.icon} size={17} color={item.danger ? theme.danger : theme.muted} /> : null}
            </Pressable>
          ))}
        </ScrollView>
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

const makeStyles = (t: AccountTheme) => ({
  scrim: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' },
  menu: {
    position: 'absolute' as const,
    backgroundColor: t.menu ?? t.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: t.border,
    overflow: 'hidden' as const,
    paddingVertical: 4,
    shadowColor: t.scrim,
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  head: { color: t.muted, fontSize: 13, lineHeight: 18, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: t.line },
  item: { ...ROW_CENTER, gap: 8, minHeight: ITEM_HEIGHT, paddingLeft: 8, paddingRight: 14 },
  line: { borderTopWidth: 1, borderTopColor: t.line },
  pressed: { backgroundColor: t.field },
  tick: { width: 20, alignItems: 'center' as const },
  label: { flex: 1, color: t.text, fontSize: 16 },
  detail: { color: t.muted, fontSize: 14 },
  pill: { ...ROW_CENTER, gap: 6, paddingVertical: 6, paddingLeft: 12, paddingRight: 10, borderRadius: 999, backgroundColor: t.field, maxWidth: 180 },
  pillText: { color: t.text, fontSize: 15, fontWeight: '500' as const, flexShrink: 1 },
});

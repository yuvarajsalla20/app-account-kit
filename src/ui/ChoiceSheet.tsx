import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useLook, useStyles } from '../look';
import type { AccountTheme } from '../theme';
import { ROW_CENTER } from './layout';

/** `V` is the kind of value an option stands for: text (the default) or a number. */
export interface Choice<V extends string | number = string> {
  value: V;
  label: string;
  /** A smaller line beside the label, such as "US dollar". */
  detail?: string;
}

interface Props<V extends string | number> {
  visible: boolean;
  title: string;
  options: readonly Choice<V>[];
  /** The chosen option gets a tick. Leave out when nothing is chosen yet (a list of actions). */
  value?: V;
  /** A tap on an option. With `onConfirm` a tap only moves the tick, and this is not needed. */
  onChoose?: (value: V) => void;
  onClose: () => void;
  /**
   * Ask before keeping: a tap moves the tick, ✓ keeps it (calls this) and ✕ or the dimmed area leaves the old choice (calls `onClose`).
   * The options are drawn as large rounded buttons, the chosen one filled with the accent.
   */
  onConfirm?: (value: V) => void;
  /** Called on every tap, before anything else, such as to play the sound just tapped. Locked options call it too. */
  onPick?: (value: V) => void;
  /** True for an option that needs the paid plan: it shows a padlock and cannot be chosen. */
  locked?: (value: V) => boolean;
  /** A tap on a locked option, such as opening the plans. Without it the sheet says, under the options, that the option is part of the paid plan. */
  onLocked?: () => void;
  /** A line of explanation under the options. */
  note?: string;
}

/**
 * A sheet that slides up from the bottom of the screen with a list to choose from. Tapping the dimmed area, or Back on Android, closes it.
 * With `onConfirm` it asks before keeping (✕ and ✓), and inside the app's own `components.Sheet` when the app has one.
 */
export function ChoiceSheet<V extends string | number = string>(props: Props<V>) {
  return props.onConfirm ? <ConfirmSheet {...props} onConfirm={props.onConfirm} /> : <ListSheet {...props} />;
}

/** The padlock beside a locked option, the tick beside the chosen one. */
function useMarks() {
  const { theme } = useLook();
  const styles = useStyles(makeStyles);
  return {
    tick: (onFill: boolean) =>
      onFill ? (
        <View style={styles.tickDisc}>
          <Feather name="check" size={16} color={theme.on} />
        </View>
      ) : (
        <Feather name="check" size={20} color={theme.on} />
      ),
    lock: (
      <View style={styles.lockDisc}>
        <Feather name="lock" size={15} color={theme.lock?.icon ?? theme.muted} />
      </View>
    ),
  };
}

/** Which option a tap on a locked one named, so the sheet can say it is part of the paid plan. Cleared each time the sheet opens. */
function useLockedTap(visible: boolean) {
  const [tapped, setTapped] = useState<string | null>(null);
  useEffect(() => {
    if (visible) setTapped(null);
  }, [visible]);
  return [tapped, setTapped] as const;
}

function ListSheet<V extends string | number>({ visible, title, options, value, onChoose, onClose, onPick, locked, onLocked, note }: Props<V>) {
  const { strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const marks = useMarks();
  const [lockedTap, setLockedTap] = useLockedTap(visible);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.fill}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel={strings.close} />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.grip} />
          <components.Text style={styles.title} accessibilityRole="header">{title}</components.Text>
          <ScrollView bounces={false}>
            {options.map((option, i) => {
              const chosen = option.value === value;
              const shut = !chosen && (locked?.(option.value) ?? false);
              const label = option.detail ? `${option.label}, ${option.detail}` : option.label;
              return (
                <Pressable
                  key={String(option.value)}
                  onPress={() => {
                    onPick?.(option.value);
                    if (!shut) return onChoose?.(option.value);
                    setLockedTap(option.label);
                    onLocked?.();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={shut ? `${label}, ${strings.lockedHint}` : label}
                  accessibilityState={{ selected: chosen }}
                  style={[styles.option, i < options.length - 1 && styles.line]}
                >
                  <components.Text style={[styles.label, shut && styles.labelShut]}>{option.label}</components.Text>
                  {option.detail ? <components.Text style={styles.detail}>{option.detail}</components.Text> : null}
                  <View style={styles.grow} />
                  {chosen ? marks.tick(false) : shut ? marks.lock : null}
                </Pressable>
              );
            })}
            <Note tapped={onLocked ? null : lockedTap} note={note} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ConfirmSheet<V extends string | number>({ visible, title, options, value, onClose, onConfirm, onPick, locked, onLocked, note }: Props<V> & { onConfirm: (value: V) => void }) {
  const { strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const marks = useMarks();
  // The draft choice starts from the saved one each time the sheet opens, so ✕ leaves nothing behind.
  const [pending, setPending] = useState(value);
  useEffect(() => {
    if (visible) setPending(value);
  }, [visible, value]);
  const [lockedTap, setLockedTap] = useLockedTap(visible);
  const keep = () => (pending === undefined ? onClose() : onConfirm(pending));

  const body = (
    <View style={styles.pills}>
      {options.map((option) => {
        const on = option.value === pending;
        const shut = locked?.(option.value) ?? false;
        const label = option.detail ? `${option.label}, ${option.detail}` : option.label;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => {
              onPick?.(option.value);
              if (!shut) return setPending(option.value);
              setLockedTap(option.label);
              onLocked?.();
            }}
            accessibilityRole="radio"
            accessibilityLabel={shut ? `${label}, ${strings.lockedHint}` : label}
            accessibilityState={{ selected: on }}
            style={[styles.pill, on && styles.pillOn]}
          >
            <View style={styles.pillWords}>
              <components.Text style={[styles.pillLabel, on && styles.pillLabelOn, shut && !on && styles.labelShut]}>{option.label}</components.Text>
              {option.detail ? <components.Text style={[styles.detail, on && styles.pillLabelOn]}>{option.detail}</components.Text> : null}
            </View>
            {on ? marks.tick(true) : shut ? marks.lock : null}
          </Pressable>
        );
      })}
      <Note tapped={onLocked ? null : lockedTap} note={note} />
    </View>
  );

  if (components.Sheet) {
    return (
      <components.Sheet title={title} visible={visible} onCancel={onClose} onConfirm={keep}>
        {body}
      </components.Sheet>
    );
  }
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.fill}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel={strings.close} />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.head}>
            <RoundButton icon="x" label={strings.cancel} onPress={onClose} />
            <components.Text style={styles.headTitle} accessibilityRole="header">{title}</components.Text>
            <RoundButton icon="check" label={strings.done} onPress={keep} solid />
          </View>
          <ScrollView bounces={false}>{body}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function RoundButton({ icon, label, onPress, solid }: { icon: 'x' | 'check'; label: string; onPress: () => void; solid?: boolean }) {
  const { theme } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={({ pressed }) => [styles.round, solid && styles.roundSolid, pressed && styles.pressed]}>
      <Feather name={icon} size={20} color={solid ? theme.ink : theme.text} />
    </Pressable>
  );
}

/** Under the options: what the tapped locked option needs, else the sheet's own note. */
function Note({ tapped, note }: { tapped: string | null; note?: string }): ReactNode {
  const { strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const text = tapped ? strings.lockedNote(tapped) : note;
  return text ? <components.Text style={styles.note}>{text}</components.Text> : null;
}

const DISC = { width: 26, height: 26, borderRadius: 13, alignItems: 'center' as const, justifyContent: 'center' as const };

const makeStyles = (t: AccountTheme) => ({
  fill: { flex: 1, justifyContent: 'flex-end' as const },
  scrim: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.scrim },
  sheet: { maxHeight: '75%' as const, backgroundColor: t.surface, borderTopLeftRadius: t.radius + 8, borderTopRightRadius: t.radius + 8, borderTopWidth: 1, borderColor: t.border, paddingHorizontal: 18, paddingBottom: 34 },
  grip: { alignSelf: 'center' as const, width: 40, height: 5, borderRadius: 3, backgroundColor: t.line, marginTop: 10, marginBottom: 14 },
  title: { color: t.text, fontSize: 19, fontWeight: '700' as const, marginBottom: 6 },
  option: { ...ROW_CENTER, gap: 12, minHeight: 52 },
  line: { borderBottomWidth: 1, borderBottomColor: t.line },
  label: { color: t.text, fontSize: 17 },
  labelShut: { color: t.muted },
  detail: { color: t.muted, fontSize: 13 },
  grow: { flex: 1 },
  // Ask-before-keeping: a ✕, the title and a ✓ across the top, then large rounded buttons.
  head: { ...ROW_CENTER, justifyContent: 'space-between' as const, paddingTop: 16, paddingBottom: 12 },
  headTitle: { color: t.text, fontSize: 18, fontWeight: '800' as const },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: t.field, borderWidth: 1, borderColor: t.border },
  roundSolid: { backgroundColor: t.accent, borderColor: t.accent },
  pressed: { opacity: 0.8 },
  pills: { gap: 14, paddingTop: 8 },
  pill: { ...ROW_CENTER, justifyContent: 'space-between' as const, gap: 12, paddingVertical: 15, paddingHorizontal: 18, borderRadius: 16, backgroundColor: t.field, borderWidth: 1, borderColor: t.border },
  pillOn: { backgroundColor: t.accent, borderColor: t.accent },
  pillWords: { flexShrink: 1, gap: 2 },
  pillLabel: { color: t.text, fontSize: 17, fontWeight: '700' as const },
  pillLabelOn: { color: t.ink },
  // The tick sits on a disc of the accent's ink, so it reads on the filled button.
  tickDisc: { ...DISC, backgroundColor: t.ink },
  lockDisc: { ...DISC, backgroundColor: t.lock?.circle ?? t.field },
  note: { color: t.muted, fontSize: 14, lineHeight: 20, marginTop: 4 },
});

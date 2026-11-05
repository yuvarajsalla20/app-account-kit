import Feather from '@expo/vector-icons/Feather';
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
  onChoose: (value: V) => void;
  onClose: () => void;
}

/** A sheet that slides up from the bottom of the screen with a list to choose from. Tapping the dimmed area, or Back on Android, closes it. */
export function ChoiceSheet<V extends string | number = string>({ visible, title, options, value, onChoose, onClose }: Props<V>) {
  const { theme, strings, components } = useLook();
  const styles = useStyles(makeStyles);
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
              return (
                <Pressable
                  key={String(option.value)}
                  onPress={() => onChoose(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={option.detail ? `${option.label}, ${option.detail}` : option.label}
                  accessibilityState={{ selected: chosen }}
                  style={[styles.option, i < options.length - 1 && styles.line]}
                >
                  <components.Text style={styles.label}>{option.label}</components.Text>
                  {option.detail ? <components.Text style={styles.detail}>{option.detail}</components.Text> : null}
                  <View style={styles.grow} />
                  {chosen ? <Feather name="check" size={20} color={theme.on} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (t: AccountTheme) => ({
  fill: { flex: 1, justifyContent: 'flex-end' as const },
  scrim: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.scrim },
  sheet: { maxHeight: '75%' as const, backgroundColor: t.surface, borderTopLeftRadius: t.radius + 8, borderTopRightRadius: t.radius + 8, borderTopWidth: 1, borderColor: t.border, paddingHorizontal: 18, paddingBottom: 34 },
  grip: { alignSelf: 'center' as const, width: 40, height: 5, borderRadius: 3, backgroundColor: t.line, marginTop: 10, marginBottom: 14 },
  title: { color: t.text, fontSize: 19, fontWeight: '700' as const, marginBottom: 6 },
  option: { ...ROW_CENTER, gap: 12, minHeight: 52 },
  line: { borderBottomWidth: 1, borderBottomColor: t.line },
  label: { color: t.text, fontSize: 17 },
  detail: { color: t.muted, fontSize: 13 },
  grow: { flex: 1 },
});

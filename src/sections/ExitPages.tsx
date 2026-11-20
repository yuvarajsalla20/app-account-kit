import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import type { ActionRunner } from '../hooks/useAction';
import { useLook, useStyles, type MenuItem } from '../look';
import { canConfirmDelete, typedWordMatches } from '../logic/deleteRules';
import type { AccountTheme } from '../theme';
import type { ActionsProps, ExitMenuProps, IconName } from '../types';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { SettingsGroup } from '../ui/Group';
import { SettingRow } from '../ui/Row';
import { CENTER } from '../ui/layout';

/** The ⋯ button on Account (7.17.0): the app's own `components.Menu`, or the kit's round button with a small list under it. */
export function ExitMenuButton({ items, onPick }: { items: readonly MenuItem[]; onPick: (id: string) => void }) {
  const { theme, strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const [open, setOpen] = useState(false);
  if (components.Menu) return <components.Menu label={strings.moreOptions} items={items} onPick={onPick} />;
  return (
    <View>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel={strings.moreOptions} accessibilityState={{ expanded: open }} hitSlop={6} style={styles.dots}>
        <Feather name="more-horizontal" size={20} color={theme.text} />
      </Pressable>
      {open ? (
        <View style={styles.list} accessibilityRole="menu">
          {items.map((item, i) => (
            <Pressable
              key={item.id}
              accessibilityRole="menuitem"
              accessibilityLabel={item.label}
              onPress={() => {
                setOpen(false);
                onPick(item.id);
              }}
              style={[styles.item, i < items.length - 1 && styles.itemLine]}
            >
              <components.Text style={[styles.itemText, item.danger && { color: theme.danger }]}>{item.label}</components.Text>
              {item.icon ? <Feather name={item.icon as IconName} size={16} color={item.danger ? theme.danger : theme.text} /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** The big round picture and words at the top of the Sign out and Delete pages. */
function Hero({ icon, title, body, danger }: { icon: IconName; title: string; body?: string; danger?: boolean }) {
  const { theme, components } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.hero}>
      <View style={[styles.circle, { backgroundColor: danger ? theme.panel : theme.field, borderColor: danger ? theme.danger : theme.border }]}>
        <Feather name={icon} size={28} color={danger ? theme.danger : theme.accent} />
      </View>
      <components.Text style={styles.heroTitle} accessibilityRole="header">{title}</components.Text>
      {body ? <components.Text style={styles.heroBody}>{body}</components.Text> : null}
    </View>
  );
}

/** Sign out on its own page (7.17.0): one clear button and a way back. */
export function SignOutPage({ onSignOut, action, onStay }: { onSignOut: NonNullable<ActionsProps['onSignOut']>; action: ActionRunner; onStay: () => void }) {
  const { strings } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.page}>
      <Hero icon="log-out" title={strings.signOutTitle} body={strings.signOutBody} />
      <Button variant="solid" label={strings.signOut} busy={action.busy} onPress={() => action.run('sign-out', onSignOut, () => strings.couldNot(strings.signOutAction))} />
      <Button variant="quiet" small label={strings.stayIn} onPress={onStay} disabled={action.busy} />
    </View>
  );
}

/** The Access page (7.24.0, `exitMenu.place: 'page'`): a Sign out row and a red Delete account row, each opening its own page, and a short line under them. */
export function AccessPage({ onSignOut, onDeleteAccount }: { onSignOut?: () => void; onDeleteAccount?: () => void }) {
  const { theme, strings, components } = useLook();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.page}>
      <SettingsGroup>
        {onSignOut ? <SettingRow last={!onDeleteAccount} icon="log-out" tint={theme.muted} label={strings.signOut} onPress={onSignOut} /> : null}
        {onDeleteAccount ? <SettingRow last danger icon="trash-2" tint={theme.danger} label={strings.deleteAccount} onPress={onDeleteAccount} /> : null}
      </SettingsGroup>
      <components.Text style={styles.accessNote}>{strings.accessNote}</components.Text>
    </View>
  );
}

type Step = 'unlock' | 'lose' | 'final';

interface DeleteProps extends Pick<ActionsProps, 'confirmsWithPassword'> {
  onDeleteAccount: NonNullable<ActionsProps['onDeleteAccount']>;
  exit: ExitMenuProps;
  action: ActionRunner;
  /** "Sign out instead": opens the Sign out page. Leave out when the app has no sign out. */
  onSignOutInstead?: () => void;
  onCancel: () => void;
}

/**
 * Delete account on its own page (7.17.0), in steps: the app's own unlock (when it passes one), what the person will
 * lose with a gentle "Sign out instead", typing DELETE, then a last sign-in check before anything is erased.
 */
export function DeleteAccountPage({ onDeleteAccount, confirmsWithPassword, exit, action, onSignOutInstead, onCancel }: DeleteProps) {
  const { theme, strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const steps: Step[] = exit.unlock ? ['unlock', 'lose', 'final'] : ['lose', 'final'];
  const [step, setStep] = useState<Step>(steps[0]!);
  const [typed, setTyped] = useState('');
  const [password, setPassword] = useState('');
  const at = steps.indexOf(step);
  const word = strings.deleteTypeWord;

  const bar = (
    <View style={styles.steps} accessible accessibilityLabel={strings.stepOf(at + 1, steps.length)}>
      {steps.map((s, i) => <View key={s} style={[styles.step, i <= at && { backgroundColor: theme.danger }]} />)}
    </View>
  );

  if (step === 'unlock' && exit.unlock) {
    return (
      <View style={styles.page}>
        {bar}
        {exit.unlock(() => setStep('lose'))}
      </View>
    );
  }

  if (step === 'lose') {
    return (
      <View style={styles.page}>
        {bar}
        <View style={styles.card}>
          {exit.losses?.length ? (
            <>
              <components.Text style={styles.cardTitle} accessibilityRole="header">{strings.deleteLoseTitle}</components.Text>
              {exit.losses.map((line) => (
                <View key={line} style={styles.loss}>
                  <Feather name="x" size={15} color={theme.danger} />
                  <components.Text style={styles.lossText}>{line}</components.Text>
                </View>
              ))}
            </>
          ) : (
            <components.Text style={styles.cardTitle} accessibilityRole="header">{strings.deleteTitle}</components.Text>
          )}
          <components.Text style={styles.small}>{strings.deleteWarning}</components.Text>
        </View>
        {onSignOutInstead ? (
          <Pressable onPress={onSignOutInstead} accessibilityRole="button" accessibilityLabel={`${strings.deleteBreakTitle} ${strings.deleteBreakAction}`} style={styles.break}>
            <View style={styles.grow}>
              <components.Text style={styles.breakTitle}>{strings.deleteBreakTitle}</components.Text>
              <components.Text style={styles.breakAction}>{strings.deleteBreakAction}</components.Text>
            </View>
            <Feather name="chevron-right" size={18} color={theme.accent} />
          </Pressable>
        ) : null}
        <Field label={strings.deleteTypeLabel(word)} value={typed} onChangeText={setTyped} autoCapitalize="characters" autoCorrect={false} autoComplete="off" placeholder={word} />
        <Button variant="outline" label={strings.continue} disabled={!typedWordMatches(typed, word)} onPress={() => setStep('final')} />
        <Button variant="quiet" small label={strings.keepAccount} onPress={onCancel} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {bar}
      <Hero icon="trash-2" danger title={strings.deleteFinalTitle} body={confirmsWithPassword ? strings.deleteFinalPassword : strings.deleteFinalProvider} />
      {confirmsWithPassword ? <Field label={strings.deletePassword} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" autoCapitalize="none" /> : null}
      <Button
        variant="outline"
        icon="trash-2"
        label={strings.deleteForever}
        busy={action.busy}
        disabled={!canConfirmDelete({ busy: action.busy, confirmsWithPassword, password })}
        // Patient: confirming may open Apple's or Google's own sheet, which waits for the person.
        onPress={() => action.run('delete-account', () => onDeleteAccount(password), (e) => action.describe(e, strings.couldNot(strings.deleteAccount.toLowerCase())), { patient: true })}
      />
      <Button variant="quiet" small label={strings.keepAccount} onPress={onCancel} disabled={action.busy} />
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  dots: { width: 40, height: 40, borderRadius: 20, ...CENTER, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border },
  list: { position: 'absolute' as const, right: 0, top: 46, minWidth: 210, backgroundColor: t.surface, borderRadius: 16, borderWidth: 1, borderColor: t.border, zIndex: 10, elevation: 6, shadowColor: t.scrim, shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  item: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, gap: 12, paddingHorizontal: 16, minHeight: 48 },
  itemLine: { borderBottomWidth: 1, borderBottomColor: t.line },
  itemText: { color: t.text, fontSize: 16, fontWeight: '600' as const },
  page: { gap: 12 },
  hero: { alignItems: 'center' as const, paddingVertical: 12, paddingHorizontal: 8, gap: 8 },
  circle: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, ...CENTER, marginBottom: 4 },
  heroTitle: { color: t.text, fontSize: 20, fontWeight: '700' as const, textAlign: 'center' as const },
  heroBody: { color: t.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' as const },
  steps: { flexDirection: 'row' as const, gap: 6, marginBottom: 4 },
  step: { flex: 1, height: 4, borderRadius: 2, backgroundColor: t.border },
  card: { gap: 8, padding: 16, borderRadius: t.radius, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border },
  cardTitle: { color: t.text, fontSize: 16, fontWeight: '700' as const, marginBottom: 2 },
  loss: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 },
  lossText: { color: t.text, fontSize: 15, flex: 1 },
  small: { color: t.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  break: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, padding: 14, borderRadius: 16, backgroundColor: t.field, borderWidth: 1, borderColor: t.border },
  accessNote: { color: t.muted, fontSize: 13, lineHeight: 18, paddingHorizontal: 6 },
  grow: { flex: 1 },
  breakTitle: { color: t.text, fontSize: 14 },
  breakAction: { color: t.accent, fontSize: 15, fontWeight: '700' as const, marginTop: 2 },
});

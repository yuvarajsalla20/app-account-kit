import { useEffect, useRef, useState, type ElementRef } from 'react';
import { AccessibilityInfo, findNodeHandle, View } from 'react-native';
import { useLook, useStyles } from '../look';
import type { ActionRunner } from '../hooks/useAction';
import { canConfirmDelete } from '../logic/deleteRules';
import type { AccountTheme } from '../theme';
import type { ActionsProps } from '../types';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';

interface Props extends Pick<ActionsProps, 'onDeleteAccount' | 'confirmsWithPassword'> {
  action: ActionRunner;
  /** Called when the confirmation panel opens, so the page can scroll it into view. */
  onReveal?: () => void;
}

/** Delete account: quiet red text on the main list, under Sign out. It asks for confirmation (with the password when the login has one). */
export function DeleteAccount({ onDeleteAccount, confirmsWithPassword, action, onReveal }: Props) {
  const { strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const panel = useRef<ElementRef<typeof View>>(null);
  // The panel is taller than the button it replaces and may open below the visible part: scroll to it and move screen-reader focus there.
  // Only the panel opening runs this: a new `onReveal` function on a later render must not pull focus back to the panel.
  const reveal = useRef(onReveal);
  reveal.current = onReveal;
  useEffect(() => {
    if (!deleting) return;
    reveal.current?.();
    const node = findNodeHandle(panel.current);
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
  }, [deleting]);
  if (!onDeleteAccount) return null;

  const cancel = () => {
    setDeleting(false);
    setPassword('');
    action.setNote(null);
  };

  return deleting ? (
    <View ref={panel} style={styles.panel} accessible accessibilityLabel={strings.deleteTitle}>
      <components.Text style={styles.title} accessibilityRole="header">{strings.deleteTitle}</components.Text>
      <components.Text style={styles.text}>{strings.deleteWarning}</components.Text>
      {confirmsWithPassword ? (
        <Field label={strings.deletePassword} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" autoCapitalize="none" />
      ) : null}
      <Button
        variant="danger"
        label={strings.deleteEverything}
        busy={action.busy}
        disabled={!canConfirmDelete({ busy: action.busy, confirmsWithPassword, password })}
        onPress={() => action.run('delete-account', () => onDeleteAccount(password), (e) => action.describe(e, strings.couldNot(strings.deleteAccount.toLowerCase())))}
      />
      <Button variant="quiet" small label={strings.keepAccount} onPress={cancel} disabled={action.busy} />
    </View>
  ) : (
    <Button variant="link" label={strings.deleteAccount} onPress={() => setDeleting(true)} />
  );
}

const makeStyles = (t: AccountTheme) => ({
  panel: { gap: 10, padding: 18, borderRadius: 18, backgroundColor: t.panel, borderWidth: 1, borderColor: t.danger },
  title: { color: t.text, fontSize: 17, fontWeight: '700' as const },
  text: { color: t.muted, fontSize: 14, lineHeight: 20 },
});

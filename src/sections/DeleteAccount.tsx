import { useState } from 'react';
import { View } from 'react-native';
import { useLook, useStyles } from '../context';
import type { ActionRunner } from '../hooks/useAction';
import { canConfirmDelete } from '../logic/deleteRules';
import type { AccountTheme } from '../theme';
import type { ActionsProps } from '../types';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';

interface Props extends Pick<ActionsProps, 'onDeleteAccount' | 'confirmsWithPassword'> {
  action: ActionRunner;
}

/** Delete account, which asks for confirmation (with the password when the login has one). Lives on the Account page. */
export function DeleteAccount({ onDeleteAccount, confirmsWithPassword, action }: Props) {
  const { strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState('');
  if (!onDeleteAccount) return null;

  const cancel = () => {
    setDeleting(false);
    setPassword('');
    action.setNote(null);
  };

  return deleting ? (
    <View style={styles.panel}>
      <components.Text style={styles.title}>{strings.deleteTitle}</components.Text>
      <components.Text style={styles.text}>{strings.deleteWarning}</components.Text>
      {confirmsWithPassword ? (
        <Field value={password} onChangeText={setPassword} placeholder={strings.deletePassword} secureTextEntry autoComplete="current-password" accessibilityLabel="Password" />
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
    <Button variant="danger" icon="trash-2" label={strings.deleteAccount} onPress={() => setDeleting(true)} />
  );
}

const makeStyles = (t: AccountTheme) => ({
  panel: { gap: 10, padding: 18, borderRadius: 18, backgroundColor: t.panel, borderWidth: 1, borderColor: t.danger },
  title: { color: t.text, fontSize: 17, fontWeight: '700' as const },
  text: { color: t.muted, fontSize: 14, lineHeight: 20 },
});

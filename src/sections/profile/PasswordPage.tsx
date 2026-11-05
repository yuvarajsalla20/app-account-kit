import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useLook } from '../../look';
import type { ActionRunner } from '../../hooks/useAction';
import { MIN_PASSWORD, passwordProblem } from '../../logic/password';
import type { PasswordProps } from '../../types';
import { Button } from '../../ui/Button';
import { Field, type InputRef } from '../../ui/Field';

interface Props extends PasswordProps {
  action: ActionRunner;
  /** Called after the password was saved, to go back to the Account page. */
  onDone: () => void;
}

/** Change password: current, new and confirm boxes, with Save below. */
export function PasswordPage({ onChange, minLength = MIN_PASSWORD, action, onDone }: Props) {
  const { strings } = useLook();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const nextBox = useRef<InputRef>(null);
  const confirmBox = useRef<InputRef>(null);

  const save = async () => {
    const problem = passwordProblem({ current, next, confirm, min: minLength });
    if (problem) return action.setNote(strings.passwordProblem(problem, minLength));
    const ok = await action.run('password', () => onChange(current, next), (e) => action.describe(e, strings.couldNot(strings.savePassword.toLowerCase())));
    if (ok) {
      onDone();
      action.setNote(strings.passwordChanged, true);
    }
  };

  return (
    <View style={{ gap: 14 }}>
      <Field label={strings.currentPassword} value={current} onChangeText={setCurrent} secureTextEntry autoComplete="current-password" textContentType="password" autoCapitalize="none" returnKeyType="next" onSubmitEditing={() => nextBox.current?.focus()} />
      <Field ref={nextBox} label={strings.newPassword} value={next} onChangeText={setNext} secureTextEntry autoComplete="new-password" textContentType="newPassword" autoCapitalize="none" returnKeyType="next" onSubmitEditing={() => confirmBox.current?.focus()} />
      <Field ref={confirmBox} label={strings.confirmPassword} value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" textContentType="newPassword" autoCapitalize="none" onSubmitEditing={save} returnKeyType="done" />
      <Button variant="solid" label={strings.savePassword} onPress={save} busy={action.busy} disabled={!current || !next || !confirm} />
    </View>
  );
}

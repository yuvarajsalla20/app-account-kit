import { useState } from 'react';
import { View } from 'react-native';
import { useLook, useStyles } from '../../context';
import type { ActionRunner } from '../../hooks/useAction';
import type { AccountTheme } from '../../theme';
import type { PasswordProps } from '../../types';
import { Button } from '../../ui/Button';
import { SettingRow } from '../../ui/Row';
import { TINTS } from '../../ui/tints';

interface Props extends PasswordProps {
  email: string;
  action: ActionRunner;
}

/** Change password: tap, read where the link goes, then Send link. */
export function PasswordRow({ onSend, email, action }: Props) {
  const { strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const [open, setOpen] = useState(false);

  const send = async () => {
    const ok = await action.run('password', onSend, (e) => action.describe(e, strings.couldNot(strings.sendEmail)));
    if (ok) {
      action.setNote(strings.linkSent(email));
      setOpen(false);
    }
  };

  return (
    <SettingRow last icon="key" tint={TINTS.password} label={strings.changePassword} onPress={() => setOpen((o) => !o)}>
      {open ? (
        <View style={styles.box}>
          <components.Text style={styles.help}>{strings.changePasswordHelp(email)}</components.Text>
          <Button variant="solid" small label={strings.sendLink} onPress={send} busy={action.busy} />
        </View>
      ) : null}
    </SettingRow>
  );
}

const makeStyles = (t: AccountTheme) => ({
  box: { gap: 10 },
  help: { color: t.muted, fontSize: 14, lineHeight: 20 },
});

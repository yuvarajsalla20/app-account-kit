import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLook } from '../../context';
import type { ActionRunner } from '../../hooks/useAction';
import { cleanNickname } from '../../logic/nickname';
import type { NicknameProps } from '../../types';
import { Field } from '../../ui/Field';

interface Props extends NicknameProps {
  saved: string;
  action: ActionRunner;
}

/** The nickname box. It saves when the person leaves it. */
export function NicknameRow({ saved, max, onSave, action }: Props) {
  const { strings } = useLook();
  const [text, setText] = useState(saved);
  useEffect(() => setText(saved), [saved]);

  const save = () => {
    const name = cleanNickname(text, max);
    setText(name);
    if (name !== saved) action.run('nickname', () => onSave(name), () => strings.couldNot(strings.saveNickname));
  };

  return (
    <View style={{ padding: 14 }}>
      <Field label={strings.nickname} value={text} onChangeText={setText} onBlur={save} onSubmitEditing={save} placeholder={strings.nicknamePlaceholder} maxLength={max} autoCapitalize="words" returnKeyType="done" />
    </View>
  );
}

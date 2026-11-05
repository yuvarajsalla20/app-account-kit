import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useLook } from '../../look';
import type { ActionRunner } from '../../hooks/useAction';
import { cleanNickname } from '../../logic/nickname';
import { createSaveTracker } from '../../logic/saveTracker';
import type { NicknameProps } from '../../types';
import { Field } from '../../ui/Field';

interface Props extends NicknameProps {
  saved: string;
  action: ActionRunner;
}

/** The nickname box. It saves when the person leaves it, presses Done, or leaves the page: each change once. */
export function NicknameRow({ saved, max, onSave, action }: Props) {
  const { strings } = useLook();
  const [text, setText] = useState(saved);
  const [tracker] = useState(() => createSaveTracker(saved));
  useEffect(() => {
    tracker.reset(saved);
    setText(saved);
  }, [saved, tracker]);

  const save = async (value: string) => {
    const name = cleanNickname(value, max);
    setText(name);
    // Another action is running: keep what was typed; it saves on the next blur, Done or when the page closes.
    if (action.busy || !tracker.begin(name)) return;
    const ok = await action.run('nickname', () => onSave(name), () => strings.couldNot(strings.saveNickname));
    tracker.finish(name, ok);
    // A failed save keeps what was typed (the note says why), and it is tried again on the next blur, Done or when the page closes.
    if (ok) action.setNote(strings.nicknameSaved, true);
  };

  // Leaving the page (Back) can unmount the box before its blur arrives, so save what is typed on the way out.
  const latest = useRef({ text, save });
  latest.current = { text, save };
  useEffect(() => () => void latest.current.save(latest.current.text), []);

  return (
    <View style={{ padding: 14 }}>
      <Field label={strings.nickname} value={text} onChangeText={setText} onBlur={() => save(text)} onSubmitEditing={() => save(text)} placeholder={strings.nicknamePlaceholder} maxLength={max} autoCapitalize="words" returnKeyType="done" />
    </View>
  );
}

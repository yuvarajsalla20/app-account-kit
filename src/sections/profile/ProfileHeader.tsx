import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLook, useStyles } from '../../look';
import type { ActionRunner } from '../../hooks/useAction';
import { initialOf } from '../../logic/nickname';
import { isPermissionError, safePhoto } from '../../logic/photo';
import type { AccountTheme } from '../../theme';
import type { PhotoProps, PhotoSource, ProfileInfo } from '../../types';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { ROW_CENTER } from '../../ui/layout';

interface Props {
  profile: ProfileInfo;
  photo?: PhotoProps;
  action: ActionRunner;
}

/** The picture, the name, the email and Change photo. */
export function ProfileHeader({ profile, photo, action }: Props) {
  const { strings, components } = useLook();
  const styles = useStyles(makeStyles);
  const [menu, setMenu] = useState(false);

  const change = async (source: PhotoSource | 'remove') => {
    if (!photo) return;
    await action.run(
      'photo',
      async () => {
        const next = source === 'remove' ? '' : await photo.pick(source);
        if (next !== null && !safePhoto(next, photo.maxChars)) throw new Error('photo-invalid');
        if (next !== null) await photo.onChange(next);
        setMenu(false);
      },
      (e) => (isPermissionError(e) ? strings.photoPermission : e instanceof Error && e.message === 'photo-invalid' ? strings.photoInvalid : strings.couldNot(strings.savePhoto)),
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.who}>
        <Avatar photo={profile.photo || profile.fallbackPhoto} initial={initialOf(profile.name, profile.email)} size={72} />
        <View style={styles.grow}>
          <components.Text style={styles.name} numberOfLines={1}>{profile.name || profile.fallbackName}</components.Text>
          {profile.email ? <components.Text style={styles.email} numberOfLines={1}>{profile.email}</components.Text> : null}
          {photo ? (
            <Pressable onPress={() => setMenu((m) => !m)} accessibilityRole="button" accessibilityState={{ expanded: menu }} hitSlop={8} style={styles.linkHit}>
              <components.Text style={styles.link}>{strings.changePhoto}</components.Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {photo && menu ? (
        <View style={styles.menu}>
          {photo.cameraSupported ? <Button small grow icon="camera" label={strings.takePhoto} onPress={() => change('camera')} disabled={action.busy} /> : null}
          <Button small grow icon="image" label={strings.library} onPress={() => change('library')} disabled={action.busy} />
          {profile.photo ? <Button small grow variant="danger" icon="x" label={strings.removePhoto} onPress={() => change('remove')} disabled={action.busy} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  wrap: { gap: 12 },
  who: { ...ROW_CENTER, gap: 16 },
  grow: { flex: 1 },
  name: { color: t.text, fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4 },
  email: { color: t.muted, fontSize: 14 },
  linkHit: { minHeight: 44, justifyContent: 'center' as const },
  link: { color: t.accent, fontSize: 14, fontWeight: '600' as const },
  menu: { flexDirection: 'row' as const, gap: 8 },
});

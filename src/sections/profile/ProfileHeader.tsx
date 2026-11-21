import Feather from '@expo/vector-icons/Feather';
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
import { CENTER, ROW_CENTER } from '../../ui/layout';

/** The centred photo's size, and the pencil on its corner. */
const BIG = 96;
const PENCIL = 32;

interface Props {
  profile: ProfileInfo;
  photo?: PhotoProps;
  action: ActionRunner;
}

/**
 * The picture, the name and Change photo. The email is its own row below the nickname.
 * With `profile.centered`, a bigger picture in the middle with a pencil on its corner instead of the name and the link.
 */
export function ProfileHeader({ profile, photo, action }: Props) {
  const { strings, components, theme } = useLook();
  const styles = useStyles(makeStyles);
  const [menu, setMenu] = useState(false);
  const toggle = () => setMenu((m) => !m);
  const initial = initialOf(profile.name, profile.email);

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
      // Picking waits for the person (camera, library, permission prompt), so it is never cut off; removing is a plain save.
      { patient: source !== 'remove' },
    );
  };

  const choices =
    photo && menu ? (
      <View style={styles.menu}>
        {photo.cameraSupported ? <Button small grow icon="camera" label={strings.takePhoto} onPress={() => change('camera')} disabled={action.busy} /> : null}
        <Button small grow icon="image" label={strings.library} onPress={() => change('library')} disabled={action.busy} />
        {profile.photo ? <Button small grow variant="danger" icon="x" label={strings.removePhoto} onPress={() => change('remove')} disabled={action.busy} /> : null}
      </View>
    ) : null;

  if (profile.centered) {
    const picture = <Avatar photo={profile.photo || profile.fallbackPhoto} initial={initial} size={BIG} />;
    return (
      <View style={styles.wrap}>
        <View style={styles.middle}>
          {photo ? (
            <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={strings.changePhoto} accessibilityState={{ expanded: menu }} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
              {picture}
              <View style={styles.pencil}>
                <Feather name="edit-2" size={15} color={theme.ink} />
              </View>
            </Pressable>
          ) : (
            picture
          )}
        </View>
        {choices}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.who}>
        <Avatar photo={profile.photo || profile.fallbackPhoto} initial={initial} size={72} />
        <View style={styles.grow}>
          <components.Text style={styles.name} numberOfLines={1}>{profile.name || profile.fallbackName}</components.Text>
          {photo ? (
            <Pressable onPress={toggle} accessibilityRole="button" accessibilityState={{ expanded: menu }} hitSlop={8} style={styles.linkHit}>
              <components.Text style={styles.link}>{strings.changePhoto}</components.Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {choices}
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  wrap: { gap: 12 },
  who: { ...ROW_CENTER, gap: 16 },
  grow: { flex: 1 },
  name: { color: t.text, fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4 },
  linkHit: { minHeight: 44, justifyContent: 'center' as const },
  link: { color: t.accent, fontSize: 14, fontWeight: '600' as const },
  menu: { flexDirection: 'row' as const, gap: 8 },
  // 7.27.1: pulled up under the page title and closer to the first card, so the photo doesn't float in empty space.
  middle: { alignItems: 'center' as const, marginTop: -12, marginBottom: -6 },
  pressed: { opacity: 0.8 },
  // Ringed in `ink` (the text colour on accent, usually the page colour) so it reads as sitting on top of the photo.
  pencil: { ...CENTER, position: 'absolute' as const, right: -2, bottom: -2, width: PENCIL, height: PENCIL, borderRadius: PENCIL / 2, backgroundColor: t.accent, borderWidth: 3, borderColor: t.ink },
});

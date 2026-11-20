import { useState } from 'react';
import { Image, View, type ImageStyle, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useLook, useStyles } from '../look';
import { safePhoto } from '../logic/photo';
import type { AccountTheme } from '../theme';
import { CENTER } from './layout';

interface Props {
  /** A picture address (https) or small data address. When empty, unsafe or broken, the initial is shown. */
  photo?: string;
  initial: string;
  size: number;
  /** 7.23.0: added to the circle (photo and initial alike), e.g. the app's own fill and edge for an avatar outside Settings. */
  style?: StyleProp<ViewStyle & ImageStyle>;
  /** 7.23.0: added to the initial's text, e.g. the app's own color, weight or size. */
  initialStyle?: StyleProp<TextStyle>;
}

/** A round profile picture, or a circle with the person's initial. */
export function Avatar({ photo, initial, size, style, initialStyle }: Props) {
  const { components, strings } = useLook();
  const styles = useStyles(makeStyles);
  const [brokenPhoto, setBrokenPhoto] = useState<string | null>(null);
  const round = { width: size, height: size, borderRadius: size / 2 };
  const show = !!photo && safePhoto(photo) && photo !== brokenPhoto;
  return show ? (
    <Image source={{ uri: photo }} style={[round, style]} accessibilityLabel={strings.profilePicture} onError={() => setBrokenPhoto(photo)} />
  ) : (
    <View style={[round, styles.center, style]}>
      <components.Text style={[styles.initial, { fontSize: size * 0.44 }, initialStyle]}>{initial}</components.Text>
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  center: { ...CENTER, backgroundColor: t.accent },
  initial: { color: t.ink, fontWeight: '700' as const },
});

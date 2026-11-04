import { Image, View } from 'react-native';
import { useLook, useStyles } from '../context';
import type { AccountTheme } from '../theme';

interface Props {
  /** A picture address or data URI. When empty, the initial is shown. */
  photo?: string;
  initial: string;
  size: number;
}

/** A round profile picture, or a circle with the person's initial. */
export function Avatar({ photo, initial, size }: Props) {
  const { components, strings } = useLook();
  const styles = useStyles(makeStyles);
  const round = { width: size, height: size, borderRadius: size / 2 };
  return photo ? (
    <Image source={{ uri: photo }} style={round} accessibilityLabel={strings.profilePicture} />
  ) : (
    <View style={[round, styles.center]}>
      <components.Text style={[styles.initial, { fontSize: size * 0.44 }]}>{initial}</components.Text>
    </View>
  );
}

const makeStyles = (t: AccountTheme) => ({
  center: { alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: t.accent },
  initial: { color: t.ink, fontWeight: '700' as const },
});

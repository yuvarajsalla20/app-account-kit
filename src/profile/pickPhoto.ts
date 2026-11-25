import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { DEFAULT_PHOTO_MAX_CHARS } from './photo';
import type { PhotoSource } from '../types';

/**
 * The profile photo picker both apps used to copy into `src/shared/photo.ts` (7.29.0). Its own entry, `app-account-kit/photo`,
 * so only apps that use it need `expo-image-picker` and `expo-image-manipulator` (optional peer dependencies).
 *
 *   import { cameraSupported, pickProfilePhoto } from 'app-account-kit/photo';
 *   photo={{ pick: pickProfilePhoto, cameraSupported, onChange }}
 */

/** The camera needs a phone. On the web only the file picker is offered. */
export const cameraSupported = Platform.OS !== 'web';

/** The side of the square photo, in pixels. */
export const PROFILE_PHOTO_SIZE = 256;
/** JPEG qualities tried in turn until the photo fits `maxChars`. The first gives about 20 to 30 KB at 256 px. */
export const PROFILE_PHOTO_QUALITIES: readonly number[] = [0.6, 0.4, 0.25];

/**
 * Lets the person pick or take a photo, crops it to a centred square and shrinks it to 256 px. Returns a small JPEG as a data
 * address that fits `maxChars` (default `DEFAULT_PHOTO_MAX_CHARS`, the 80,000 both apps' database rules allow), or null when
 * cancelled. Throws an Error saying "permission" when camera access is refused, which Settings shows as "Allow access...".
 */
export const pickProfilePhoto = async (source: PhotoSource, { maxChars = DEFAULT_PHOTO_MAX_CHARS }: { maxChars?: number } = {}): Promise<string | null> => {
  // Only the camera needs permission; the photo picker lets people hand over one picture without it.
  if (source === 'camera' && !(await ImagePicker.requestCameraPermissionsAsync()).granted) throw new Error('permission');

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;

  // The picker's own crop is not available everywhere, so make it square here too. This does nothing if it already is.
  const side = Math.min(asset.width, asset.height);
  const image = await ImageManipulator.manipulate(asset.uri)
    .crop({ originX: (asset.width - side) / 2, originY: (asset.height - side) / 2, width: side, height: side })
    .resize({ width: PROFILE_PHOTO_SIZE, height: PROFILE_PHOTO_SIZE })
    .renderAsync();
  let photo: string | null = null;
  for (const compress of PROFILE_PHOTO_QUALITIES) {
    const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress, base64: true });
    photo = saved.base64 ? `data:image/jpeg;base64,${saved.base64}` : null;
    if (!photo || photo.length <= maxChars) return photo;
  }
  // Still too big at the lowest quality: hand it back, and Settings says the photo cannot be used.
  return photo;
};

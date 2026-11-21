/**
 * The most characters a photo kept as a data address may have (7.29.0: 80,000, about 60 KB; was 400,000). It matches the limit in
 * both apps' Firestore rules, so a photo the kit accepts is never refused by the server. The 256 px photo from
 * `pickProfilePhoto` is about 27,000.
 */
export const DEFAULT_PHOTO_MAX_CHARS = 80_000;

/** A photo the kit will keep or show: empty (none), a small jpeg/png/webp data address, or an https address. */
export const safePhoto = (photo: string | undefined | null, maxChars: number = DEFAULT_PHOTO_MAX_CHARS): boolean => {
  if (!photo) return true;
  if (photo.length > maxChars) return false;
  return /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo) || /^https:\/\/\S+$/i.test(photo);
};

/** True when the picker threw because access was refused (its Error says "permission"). */
export const isPermissionError = (error: unknown): boolean => error instanceof Error && error.message === 'permission';

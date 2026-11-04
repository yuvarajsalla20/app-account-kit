/** The most characters a photo kept as a data address may have (about 300 KB), so it fits in a database record. */
export const DEFAULT_PHOTO_MAX_CHARS = 400_000;

/** A photo the kit will keep or show: empty (none), a small jpeg/png/webp data address, or an https address. */
export const safePhoto = (photo: string | undefined | null, maxChars: number = DEFAULT_PHOTO_MAX_CHARS): boolean => {
  if (!photo) return true;
  if (photo.length > maxChars) return false;
  return /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo) || /^https:\/\/\S+$/i.test(photo);
};

/** True when the picker threw because access was refused (its Error says "permission"). */
export const isPermissionError = (error: unknown): boolean => error instanceof Error && error.message === 'permission';

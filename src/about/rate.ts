/** Rate can only open the review screen once the app has an App Store number (it exists after the app is created in App Store Connect); before that the row says it is not available yet. */
export const canRate = (appStoreId?: string): appStoreId is string => !!appStoreId && /^\d+$/.test(appStoreId.trim());

/** Opens the App Store app straight on its "Write a Review" screen, where the person picks stars and writes a title and review. */
export const reviewUrl = (appStoreId: string): string => `itms-apps://itunes.apple.com/app/id${appStoreId.trim()}?action=write-review`;

/** The same page on the web, used when the App Store address cannot be opened. */
export const reviewWebUrl = (appStoreId: string): string => `https://apps.apple.com/app/id${appStoreId.trim()}?action=write-review`;

/** 7.27.0: a Google Play package name, such as com.example.app (letters, digits and underscores in at least two dot-separated parts). */
export const canRatePlay = (playPackage?: string): playPackage is string => !!playPackage && /^[A-Za-z][\w]*(\.[A-Za-z][\w]*)+$/.test(playPackage.trim());

/** Opens the Play Store app on the app's own page, where the person can rate it. */
export const playReviewUrl = (playPackage: string): string => `market://details?id=${playPackage.trim()}`;

/** The same page on the web, used when the Play Store app cannot be opened. */
export const playReviewWebUrl = (playPackage: string): string => `https://play.google.com/store/apps/details?id=${playPackage.trim()}`;

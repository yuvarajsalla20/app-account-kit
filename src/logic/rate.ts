/** Rate can only open the review screen once the app has an App Store number (it exists after the app is created in App Store Connect); before that the row says it is not available yet. */
export const canRate = (appStoreId?: string): appStoreId is string => !!appStoreId && /^\d+$/.test(appStoreId.trim());

/** Opens the App Store app straight on its "Write a Review" screen, where the person picks stars and writes a title and review. */
export const reviewUrl = (appStoreId: string): string => `itms-apps://itunes.apple.com/app/id${appStoreId.trim()}?action=write-review`;

/** The same page on the web, used when the App Store address cannot be opened. */
export const reviewWebUrl = (appStoreId: string): string => `https://apps.apple.com/app/id${appStoreId.trim()}?action=write-review`;

/** Centre a box's content both ways. Shared so the pieces cannot drift apart. */
export const CENTER = { alignItems: 'center' as const, justifyContent: 'center' as const };

/** A row whose items line up on their middle. */
export const ROW_CENTER = { flexDirection: 'row' as const, alignItems: 'center' as const };

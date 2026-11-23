/** `#rrggbb` at `alpha`, as `#rrggbbaa`. Any other color comes back unchanged (null), so the caller can fall back. */
export const withAlpha = (color: string, alpha: number): string | null =>
  /^#[0-9a-f]{6}$/i.test(color) ? `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : null;

/** 8.0.0: how solid a pull-down menu is over its frosted blur on iPhone. Apple's own menus sit close to this, so the rows under them never show through the words. */
export const MENU_GLASS = 0.92;

/** 8.0.0: the strength of the frosted blur the kit asks `components.MenuBackdrop` for (0 to 100, as in expo-blur). */
export const MENU_BLUR = 90;

/**
 * 8.0.0: the fill of every pull-down menu, chosen by the kit so each app reads the same: the app's card color (`surface`, or
 * `panel` when `surface` is not a #rrggbb color), solid, or at `MENU_GLASS` when a frosted blur sits behind it.
 */
export const menuFill = (surface: string, panel: string, glass: boolean): string => {
  const base = withAlpha(surface, 1) ? surface : withAlpha(panel, 1) ? panel : surface;
  return glass ? (withAlpha(base, MENU_GLASS) ?? base) : base;
};

/** A rectangle on screen, as measureInWindow gives it. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GAP = 6;
const EDGE = 12;

/**
 * Where a pull-down menu goes (7.26.0): its right edge lines up with the row's right edge, right under the row, or right
 * above it when it would run off the bottom. It never leaves the screen. With no row measured it sits in the middle.
 */
export function placeMenu(anchor: Box | null, menu: { width: number; height: number }, screen: { width: number; height: number }): { top: number; left: number } {
  const clampLeft = (left: number) => Math.max(EDGE, Math.min(left, screen.width - menu.width - EDGE));
  const clampTop = (top: number) => Math.max(EDGE + 40, Math.min(top, screen.height - menu.height - EDGE));
  if (!anchor) return { top: clampTop((screen.height - menu.height) / 2), left: clampLeft((screen.width - menu.width) / 2) };
  const left = clampLeft(anchor.x + anchor.width - menu.width - EDGE);
  const below = anchor.y + anchor.height + GAP;
  const fitsBelow = below + menu.height <= screen.height - EDGE;
  return { top: clampTop(fitsBelow ? below : anchor.y - GAP - menu.height), left };
}

/** A rectangle on screen, as measureInWindow gives it. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const EDGE = 12;
/** Room kept clear at the top for the status bar. */
const TOP = EDGE + 40;

/**
 * Where a pull-down menu goes. 7.32.0: it opens over the row that opened it, like iOS. Its bottom edge sits on the row's bottom
 * edge and it grows upward, covering the row; when there is no room above, its top edge sits on the row's top edge and it grows
 * downward. Its right edge lines up with the row's right edge. It never leaves the screen. With no row measured it sits in the middle.
 */
export function placeMenu(anchor: Box | null, menu: { width: number; height: number }, screen: { width: number; height: number }): { top: number; left: number } {
  const clampLeft = (left: number) => Math.max(EDGE, Math.min(left, screen.width - menu.width - EDGE));
  const clampTop = (top: number) => Math.max(TOP, Math.min(top, screen.height - menu.height - EDGE));
  if (!anchor) return { top: clampTop((screen.height - menu.height) / 2), left: clampLeft((screen.width - menu.width) / 2) };
  const left = clampLeft(anchor.x + anchor.width - menu.width - EDGE);
  const upward = anchor.y + anchor.height - menu.height;
  return { top: clampTop(upward >= TOP ? upward : anchor.y), left };
}

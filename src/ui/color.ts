/** `#rrggbb` at `alpha`, as `#rrggbbaa`. Any other color comes back unchanged (null), so the caller can fall back. */
export const withAlpha = (color: string, alpha: number): string | null =>
  /^#[0-9a-f]{6}$/i.test(color) ? `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : null;

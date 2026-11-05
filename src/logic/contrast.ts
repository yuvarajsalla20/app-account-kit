import type { AccountTheme } from '../theme';

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** One pair that is hard to read: the two theme names, how strong the contrast is (null when a color could not be read) and the least it should be. */
export interface ContrastProblem {
  pair: string;
  ratio: number | null;
  min: number;
}

/** Text should reach 4.5, an icon or placeholder 3 (the WCAG AA levels). */
const TEXT = 4.5;
const ICON = 3;
type Back = 'surface' | 'field' | 'panel' | 'accent';
const PAIRS: ReadonlyArray<readonly [keyof AccountTheme, Back, number]> = [
  ['text', 'surface', TEXT], ['muted', 'surface', TEXT], ['faint', 'surface', ICON], ['danger', 'surface', TEXT], ['accent', 'surface', TEXT],
  ['text', 'field', TEXT], ['text', 'panel', TEXT], ['muted', 'panel', TEXT], ['danger', 'panel', TEXT], ['ink', 'accent', TEXT],
];

/** Reads hex (3, 4, 6 or 8 digits) and rgb/rgba colors. Anything else (a color name) is null. */
const parse = (color: string): Rgba | null => {
  const c = color.trim().toLowerCase();
  if (c.startsWith('#')) {
    const h = c.slice(1);
    if (!/^[0-9a-f]+$/.test(h)) return null;
    const full = h.length === 3 || h.length === 4 ? [...h].map((d) => d + d).join('') : h;
    if (full.length !== 6 && full.length !== 8) return null;
    const at = (i: number) => parseInt(full.slice(i, i + 2), 16);
    return { r: at(0), g: at(2), b: at(4), a: full.length === 8 ? at(6) / 255 : 1 };
  }
  const fn = /^([a-z]+)\(([^)]*)\)$/.exec(c);
  if (!fn || (fn[1] !== 'rgb' && fn[1] !== 'rgba')) return null;
  const [r, g, b, a = 1] = fn[2]!.split(',').map((part) => Number(part.trim()));
  return [r, g, b, a].every((n) => Number.isFinite(n)) ? { r: r!, g: g!, b: b!, a } : null;
};

/** A see-through color laid over a solid one. */
const over = (top: Rgba, base: Rgba): Rgba => ({
  r: top.r * top.a + base.r * (1 - top.a),
  g: top.g * top.a + base.g * (1 - top.a),
  b: top.b * top.a + base.b * (1 - top.a),
  a: 1,
});

const light = ({ r, g, b }: Rgba): number => {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr! + 0.7152 * lg! + 0.0722 * lb!;
};

/**
 * Checks that the theme's text is readable on the cards, boxes and panel it sits on, given the app's page `background`
 * (a solid color). Returns the pairs that fall short, so the list is empty when all is well. Call it in a test or in development;
 * the kit cannot see the app's colors until the app hands them over. Icon tints are not checked.
 */
export const themeContrast = (theme: AccountTheme, background: string): ContrastProblem[] => {
  const page = parse(background);
  const problems: ContrastProblem[] = [];
  for (const [front, back, min] of PAIRS) {
    const top = parse(theme[back]);
    const fg = parse(theme[front] as string);
    if (!page || !top || !fg) {
      problems.push({ pair: `${front} on ${back}`, ratio: null, min });
      continue;
    }
    const ground = over(top, page);
    const [a, b] = [light(over(fg, ground)), light(ground)];
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    if (ratio < min) problems.push({ pair: `${front} on ${back}`, ratio: Math.round(ratio * 100) / 100, min });
  }
  return problems;
};

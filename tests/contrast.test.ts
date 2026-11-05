import { describe, expect, it } from 'vitest';
import { themeContrast } from '../src/logic/contrast';
import { THEME } from './helpers/theme';

const dark = { ...THEME, text: '#ffffff', muted: '#d6cdf0', faint: '#b9aedd', accent: '#ffffff', ink: '#2a1062', surface: 'rgba(255,255,255,0.15)', field: 'rgba(255,255,255,0.12)', panel: '#2a1062', danger: '#ffc2c2', on: '#7dffb0', brand: '#ffd479', scrim: 'rgba(0,0,0,0.6)' };

describe('themeContrast', () => {
  it('passes the purple theme from the README on its page color (the old greys did not)', () => {
    expect(themeContrast(dark, '#3b1d8f')).toEqual([]);
  });

  it('names small grey text that is too faint, with its ratio', () => {
    const found = themeContrast({ ...dark, muted: '#bbbbbb' }, '#3b1d8f');
    expect(found.map((p) => p.pair)).toContain('muted on surface');
    expect(found.find((p) => p.pair === 'muted on surface')).toMatchObject({ min: 4.5 });
    expect(found.find((p) => p.pair === 'muted on surface')!.ratio).toBeLessThan(4.5);
  });

  it('asks less of icons than of text', () => {
    const grey = '#a79bd0';
    expect(themeContrast({ ...dark, faint: grey }, '#3b1d8f').map((p) => p.pair)).not.toContain('faint on surface');
    expect(themeContrast({ ...dark, muted: grey }, '#3b1d8f').map((p) => p.pair)).toContain('muted on surface');
    expect(themeContrast({ ...dark, faint: '#9d8fcc' }, '#3b1d8f').map((p) => p.pair)).toContain('faint on surface');
  });

  it('reads short hex, rgb and rgba colors', () => {
    expect(themeContrast({ ...dark, text: '#fff', muted: 'rgb(255, 255, 255)', faint: 'rgba(255,255,255,1)' }, '#000')).toEqual([]);
  });

  it('checks the app name against the page, and the chosen-option tick against the sheet', () => {
    expect(themeContrast({ ...dark, brand: '#4a2a9f' }, '#3b1d8f').map((p) => p.pair)).toContain('brand on page');
    expect(themeContrast({ ...dark, on: '#4a2a9f' }, '#3b1d8f').map((p) => p.pair)).toContain('on on surface');
    expect(themeContrast(dark, '#3b1d8f').map((p) => p.pair)).not.toContain('brand on page');
  });

  it('reports a color it cannot read instead of passing it', () => {
    const found = themeContrast({ ...dark, text: 'white' }, '#3b1d8f');
    expect(found.filter((p) => p.ratio === null).map((p) => p.pair)).toContain('text on surface');
    expect(themeContrast(dark, 'purple').every((p) => p.ratio === null)).toBe(true);
  });
});

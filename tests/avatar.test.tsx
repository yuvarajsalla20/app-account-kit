import { describe, expect, it } from 'vitest';
import { AccountProvider } from '../src/context';
import { Avatar } from '../src/ui/Avatar';
import { THEME } from './helpers/theme';
import { mount } from './helpers/render';

/** The stub has no StyleSheet.flatten: merge style arrays by hand. */
const flat = (s: unknown): Record<string, unknown> =>
  Array.isArray(s) ? Object.assign({}, ...s.map(flat)) : s && typeof s === 'object' ? (s as Record<string, unknown>) : {};

describe('Avatar style and initialStyle (7.23.0)', () => {
  it("adds the app's own circle and initial styles", () => {
    const h = mount(
      <AccountProvider theme={THEME}>
        <Avatar initial="S" size={34} style={{ backgroundColor: '#123456', borderWidth: 1 }} initialStyle={{ color: '#abcdef', fontWeight: '400' }} />
      </AccountProvider>,
    );
    const circle = h.root.root.findAll((n) => typeof n.type === 'string' && flat(n.props.style)?.width === 34)[0];
    expect(flat(circle.props.style)).toMatchObject({ backgroundColor: '#123456', borderWidth: 1, borderRadius: 17 });
    const initial = h.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === 'S')[0];
    expect(flat(initial.props.style)).toMatchObject({ color: '#abcdef', fontWeight: '400' });
  });

  it('keeps the theme look when no styles are passed', () => {
    const h = mount(
      <AccountProvider theme={THEME}>
        <Avatar initial="S" size={34} />
      </AccountProvider>,
    );
    const circle = h.root.root.findAll((n) => typeof n.type === 'string' && flat(n.props.style)?.width === 34)[0];
    expect(flat(circle.props.style).backgroundColor).toBe(THEME.accent);
  });

  it('puts the circle style on a photo too', () => {
    const h = mount(
      <AccountProvider theme={THEME}>
        <Avatar photo="https://x.y/me.png" initial="S" size={34} style={{ borderWidth: 1 }} />
      </AccountProvider>,
    );
    const img = h.root.root.findAll((n) => typeof n.type === 'string' && n.props.source?.uri === 'https://x.y/me.png')[0];
    expect(flat(img.props.style)).toMatchObject({ borderWidth: 1, width: 34 });
  });
});

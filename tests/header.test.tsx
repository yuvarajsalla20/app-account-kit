import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../src/SettingsScreen';
import { DEFAULT_STRINGS as S } from '../src/strings';
import type { SettingsScreenProps } from '../src/types';
import { THEME } from './helpers/theme';
import { mount, press } from './helpers/render';

const props: SettingsScreenProps = {
  onBack: vi.fn(),
  profile: { name: 'Yuva', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  data: { label: 'Download', formats: [{ id: 'csv', label: 'CSV', onDownload: async () => {} }] },
  app: { content: null },
  about: { appName: 'My App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: true, onSignOut: async () => {}, onDeleteAccount: async () => {} },
};
const flat = (s: unknown): Record<string, unknown> => Object.assign({}, ...[s].flat(Infinity).filter(Boolean));
const heading = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'header')[0];

describe('page header', () => {
  it('shows the first page title big and left, and every other page title smaller and centred beside the arrow', async () => {
    const h = mount(<SettingsScreen theme={THEME} {...props} />);
    expect(flat(heading(h)!.props.style)).toMatchObject({ fontSize: 30, fontWeight: '700' });
    for (const [label, title] of [[S.account, S.account], [S.myData, S.myData], [S.app, S.app]] as const) {
      await press(h.byLabel(label));
      const t = heading(h)!;
      expect(t.props.children).toBe(title);
      expect(flat(t.props.style)).toMatchObject({ fontSize: 20, fontWeight: '600' });
      // The arrow floats at the left of the same row, so the title is what the row centres.
      expect(flat(h.byLabel(S.back).props.style)).toMatchObject({ position: 'absolute', left: 0 });
      expect(flat(t.parent!.parent!.props.style)).toMatchObject({ alignItems: 'center', justifyContent: 'center', marginBottom: 22 });
      await press(h.byLabel(S.back));
    }
  });

  it('keeps the arrow on the big first page in the flow, not floating', () => {
    const h = mount(<SettingsScreen theme={THEME} {...props} backLabel="Back to Upcoming" />);
    expect(flat(h.byLabel('Back to Upcoming').props.style).position).toBeUndefined();
  });
});

describe('Delete account button', () => {
  it('is an outlined red button with a trash icon, the same size as Sign out', () => {
    const h = mount(<SettingsScreen theme={THEME} {...props} />);
    const del = flat(h.byLabel(S.deleteAccount).props.style instanceof Function ? h.byLabel(S.deleteAccount).props.style({ pressed: false }) : h.byLabel(S.deleteAccount).props.style);
    const out = flat(h.byLabel(S.signOut).props.style instanceof Function ? h.byLabel(S.signOut).props.style({ pressed: false }) : h.byLabel(S.signOut).props.style);
    expect(del).toMatchObject({ borderWidth: 1, borderColor: THEME.danger, minHeight: out.minHeight, borderRadius: out.borderRadius });
    expect(del.backgroundColor).toBeUndefined();
    const icons = h.byLabel(S.deleteAccount).findAll((n) => n.type === 'Icon');
    expect(icons.map((i) => i.props.name)).toEqual(['trash-2']);
    expect(icons[0]!.props.color).toBe(THEME.danger);
  });
});

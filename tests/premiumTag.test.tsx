import { describe, expect, it, vi } from 'vitest';
import { SettingsNavContext } from '../src/nav';
import { PageRow } from '../src/sections/AccountPage';
import { DEFAULT_STRINGS as S } from '../src/strings';
import { PremiumTag, premiumGold } from '../src/ui/PremiumTag';
import { SettingRow } from '../src/ui/Row';
import { THEME } from './helpers/theme';
import { mount, press } from './helpers/render';

const texts = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => typeof n.type === 'string' && typeof n.props.children === 'string').map((n) => n.props.children as string);

describe('Premium tag (7.34.0)', () => {
  it('reads PREMIUM, in the comparison gold (tints.rate) unless theme.premium is set', () => {
    const h = mount(<PremiumTag />);
    expect(texts(h)).toContain('PREMIUM');
    expect(premiumGold(THEME)).toBe(THEME.tints.rate);
    expect(premiumGold({ ...THEME, premium: '#123456' })).toBe('#123456');
  });

  it('sits after the label of a premium row, and screen readers hear Premium after the name', () => {
    const h = mount(<SettingRow icon="download" tint="#000000" label="Data Export" premium onPress={() => {}} />);
    expect(texts(h)).toEqual(['Data Export', 'PREMIUM']);
    expect(h.has(`Data Export, ${S.premiumTag}`)).toBe(true);
  });

  it('a plain row has no tag', () => {
    const h = mount(<SettingRow icon="user" tint="#000000" label="Nickname" onPress={() => {}} />);
    expect(texts(h)).toEqual(['Nickname']);
  });

  it('a locked premium page row shows the tag and padlock only, and a tap opens the plans', async () => {
    const onLocked = vi.fn();
    const onOpen = vi.fn();
    const pick = vi.fn();
    const h = mount(<PageRow last tint="#000000" onOpen={onOpen} page={{ id: 'export', label: 'Data Export', icon: 'download', premium: true, locked: true, onLocked, menu: { pill: 'Choose', items: [{ id: 'csv', label: 'CSV File' }], onPick: pick }, content: null }} />);
    expect(texts(h)).toEqual(['Data Export', 'PREMIUM']);
    await press(h.byLabel(`Data Export, ${S.premiumTag}, ${S.lockedHint}`));
    expect(onLocked).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
    expect(pick).not.toHaveBeenCalled();
  });

  it('7.35.0: a locked row with lockedOpens and no onLocked opens that Settings page', async () => {
    const open = vi.fn();
    const onOpen = vi.fn();
    const h = mount(
      <SettingsNavContext.Provider value={{ open }}>
        <PageRow last tint="#000000" onOpen={onOpen} page={{ id: 'export', label: 'Data Export', icon: 'download', premium: true, locked: true, lockedOpens: 'premium', content: null }} />
      </SettingsNavContext.Provider>,
    );
    await press(h.byLabel(`Data Export, ${S.premiumTag}, ${S.lockedHint}`));
    expect(open).toHaveBeenCalledWith('premium');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('an unlocked premium menu row keeps its menu pill and the tag', () => {
    const h = mount(<PageRow last tint="#000000" onOpen={() => {}} page={{ id: 'export', label: 'Data Export', icon: 'download', premium: true, menu: { pill: 'Choose', items: [{ id: 'csv', label: 'CSV File' }], onPick: () => {} }, content: null }} />);
    expect(texts(h)).toEqual(expect.arrayContaining(['Data Export', 'PREMIUM', 'Choose']));
  });
});

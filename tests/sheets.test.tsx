import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChoiceSheet } from '../src/ui/ChoiceSheet';
import { ExpandRow } from '../src/ui/ExpandRow';
import { PickerRow } from '../src/ui/PickerRow';
import { SettingRow } from '../src/ui/Row';
import { DEFAULT_STRINGS as S } from '../src/strings';
import { act, mount, press } from './helpers/render';
import { THEME } from './helpers/theme';
import { AccountProvider } from '../src/context';

const options = [
  { value: 'USD', label: 'USD', detail: 'US dollar' },
  { value: 'GBP', label: 'GBP', detail: 'British pound' },
];
const open = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => n.type === 'Modal').length === 1;
const ticks = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => n.type === 'Icon' && n.props.name === 'check');

describe('ExpandRow', () => {
  const setup = () => mount(<ExpandRow icon="mail" tint="x" label="More">{'hidden text'}</ExpandRow>);
  const shows = (h: ReturnType<typeof setup>) => h.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === 'hidden text').length > 0;

  it('keeps its content out of sight until tapped, tells screen readers which way it is, and closes on a second tap', async () => {
    const h = setup();
    expect(shows(h)).toBe(false);
    expect(h.byLabel('More').props.accessibilityState).toMatchObject({ expanded: false });
    await press(h.byLabel('More'));
    expect(shows(h)).toBe(true);
    expect(h.byLabel('More').props.accessibilityState).toMatchObject({ expanded: true });
    await press(h.byLabel('More'));
    expect(shows(h)).toBe(false);
  });

  it('turns its arrow down while open', async () => {
    const h = setup();
    const arrow = () => h.root.root.findAll((n) => n.type === 'Icon' && String(n.props.name).startsWith('chevron')).map((n) => n.props.name);
    expect(arrow()).toEqual(['chevron-right']);
    await press(h.byLabel('More'));
    expect(arrow()).toEqual(['chevron-down']);
  });
});

describe('ChoiceSheet', () => {
  it('draws nothing while closed, and puts the tick only on the chosen option', () => {
    const closed = mount(<ChoiceSheet visible={false} title="Currency" options={options} value="USD" onChoose={() => {}} onClose={() => {}} />);
    expect(open(closed)).toBe(false);
    const h = mount(<ChoiceSheet visible title="Currency" options={options} value="GBP" onChoose={() => {}} onClose={() => {}} />);
    expect(open(h)).toBe(true);
    expect(h.byLabel('GBP, British pound').props.accessibilityState).toMatchObject({ selected: true });
    expect(h.byLabel('USD, US dollar').props.accessibilityState).toMatchObject({ selected: false });
    expect(ticks(h)).toHaveLength(1);
  });

  it('shows no tick when nothing is chosen, as for a list of actions', () => {
    const h = mount(<ChoiceSheet visible title="Download" options={options} onChoose={() => {}} onClose={() => {}} />);
    expect(ticks(h)).toHaveLength(0);
  });

  it('closes from the dimmed area and from Android Back, and reports the option tapped', async () => {
    const onClose = vi.fn();
    const onChoose = vi.fn();
    const h = mount(<ChoiceSheet visible title="Currency" options={options} onChoose={onChoose} onClose={onClose} />);
    await press(h.byLabel(S.close));
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => void h.root.root.findAll((n) => n.type === 'Modal')[0]!.props.onRequestClose());
    expect(onClose).toHaveBeenCalledTimes(2);
    await press(h.byLabel('GBP, British pound'));
    expect(onChoose).toHaveBeenCalledWith('GBP');
  });

  it('has a heading for screen readers', () => {
    const h = mount(<ChoiceSheet visible title="Currency" options={options} onChoose={() => {}} onClose={() => {}} />);
    expect(h.root.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'header' && n.props.children === 'Currency')).toHaveLength(1);
  });
});

describe('PickerRow', () => {
  const setup = (value = 'USD', onChange = vi.fn()) => ({ onChange, ...mount(<PickerRow icon="dollar-sign" tint="x" label="Currency" options={options} value={value} onChange={onChange} />) });

  it('shows the current choice on the right and opens the sheet on a tap', async () => {
    const h = setup();
    expect(h.byLabel('Currency').props.accessibilityValue).toEqual({ text: 'USD' });
    expect(open(h)).toBe(false);
    await press(h.byLabel('Currency'));
    expect(open(h)).toBe(true);
  });

  it('closes after a choice and reports it; choosing the same one just closes', async () => {
    const h = setup();
    await press(h.byLabel('Currency'));
    await press(h.byLabel('USD, US dollar'));
    expect(h.onChange).not.toHaveBeenCalled();
    expect(open(h)).toBe(false);
    await press(h.byLabel('Currency'));
    await press(h.byLabel('GBP, British pound'));
    expect(h.onChange).toHaveBeenCalledWith('GBP');
    expect(open(h)).toBe(false);
  });

  it('closes without a change from the dimmed area', async () => {
    const h = setup();
    await press(h.byLabel('Currency'));
    await press(h.byLabel(S.close));
    expect(open(h)).toBe(false);
    expect(h.onChange).not.toHaveBeenCalled();
  });

  it('shows the raw value when it is not one of the options', () => {
    expect(setup('EUR').byLabel('Currency').props.accessibilityValue).toEqual({ text: 'EUR' });
  });
});

describe('numbers as option values', () => {
  const minutes = [{ value: 0, label: 'At time' }, { value: 15, label: '15 min' }];

  it('keeps the number: shows its label, ticks it, and reports a number', async () => {
    const onChange = vi.fn();
    const h = mount(<PickerRow icon="clock" tint="x" label="Remind" options={minutes} value={0} onChange={onChange} />);
    expect(h.byLabel('Remind').props.accessibilityValue).toEqual({ text: 'At time' });
    await press(h.byLabel('Remind'));
    expect(h.byLabel('At time').props.accessibilityState).toMatchObject({ selected: true });
    await press(h.byLabel('15 min'));
    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('shows the explanation line under the row label', () => {
    const h = mount(<PickerRow icon="clock" tint="x" label="Remind" detail="Before it is due" options={minutes} value={15} onChange={() => {}} />);
    expect(h.byLabel('Remind, Before it is due')).toBeDefined();
    expect(h.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === 'Before it is due')).toHaveLength(1);
  });
});

describe('ChoiceSheet that asks before keeping', () => {
  const sounds = [
    { value: 'bell', label: 'Bell' },
    { value: 'harp', label: 'Harp' },
    { value: 'gold', label: 'Gold' },
  ];
  const setup = (over: Record<string, unknown> = {}) => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const onPick = vi.fn();
    const onLocked = vi.fn();
    const h = mount(<ChoiceSheet visible title="Sound" options={sounds} value="bell" onConfirm={onConfirm} onClose={onClose} onPick={onPick} locked={(v) => v === 'gold'} {...over} />);
    return { h, onConfirm, onClose, onPick, onLocked };
  };

  it('moves the tick on a tap and keeps it only on ✓; ✕ leaves the old choice', async () => {
    const { h, onConfirm, onClose, onPick } = setup();
    await press(h.byLabel('Harp'));
    expect(onPick).toHaveBeenCalledWith('harp');
    expect(onConfirm).not.toHaveBeenCalled();
    expect(h.byLabel('Harp').props.accessibilityState).toMatchObject({ selected: true });
    await press(h.byLabel(S.done));
    expect(onConfirm).toHaveBeenCalledWith('harp');
    await press(h.byLabel(S.cancel));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('puts a padlock on a locked option, which cannot be ticked and says why, or opens the plans', async () => {
    const { h, onConfirm, onPick } = setup();
    const locks = () => h.root.root.findAll((n) => n.type === 'Icon' && n.props.name === 'lock');
    expect(locks()).toHaveLength(1);
    await press(h.byLabel(`Gold, ${S.lockedHint}`));
    expect(onPick).toHaveBeenCalledWith('gold');
    expect(h.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === S.lockedNote('Gold')).length).toBe(1);
    await press(h.byLabel(S.done));
    expect(onConfirm).toHaveBeenCalledWith('bell');

    const onLocked = vi.fn();
    const h2 = mount(<ChoiceSheet visible title="Sound" options={sounds} value="bell" onConfirm={() => {}} onClose={() => {}} locked={(v) => v === 'gold'} onLocked={onLocked} />);
    await press(h2.byLabel(`Gold, ${S.lockedHint}`));
    expect(onLocked).toHaveBeenCalledTimes(1);
    expect(h2.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === S.lockedNote('Gold')).length).toBe(0);
  });

  it("draws inside the app's own sheet when it has one", async () => {
    const Sheet = ({ title, onConfirm, children }: { title: string; onConfirm: () => void; children: ReactNode }) => (
      <AppSheet title={title} onConfirm={onConfirm}>{children}</AppSheet>
    );
    const h = mount(
      <AccountProvider theme={THEME} components={{ Sheet }}>
        <ChoiceSheet visible title="Sound" options={sounds} value="bell" onConfirm={() => {}} onClose={() => {}} />
      </AccountProvider>,
    );
    expect(h.root.root.findAll((n) => n.type === AppSheet).length).toBe(1);
  });
});

function AppSheet({ children }: { title: string; onConfirm: () => void; children: ReactNode }) {
  return <>{children}</>;
}

describe('SettingRow for a paid feature', () => {
  it('shows a padlock instead of the arrow while locked, and a download icon once open', async () => {
    const onPress = vi.fn();
    const icons = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => n.type === 'Icon').map((n) => n.props.name);
    const shut = mount(<SettingRow icon="file" tint="x" label="PDF File" locked onPress={onPress} />);
    expect(icons(shut)).toEqual(['file', 'lock']);
    await press(shut.byLabel(`PDF File, ${S.lockedHint}`));
    expect(onPress).toHaveBeenCalledTimes(1);
    const open = mount(<SettingRow icon="file" tint="x" label="PDF File" trailing="download" onPress={onPress} />);
    expect(icons(open)).toEqual(['file', 'download']);
  });
});

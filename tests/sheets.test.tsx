import { describe, expect, it, vi } from 'vitest';
import { ChoiceSheet } from '../src/ui/ChoiceSheet';
import { ExpandRow } from '../src/ui/ExpandRow';
import { PickerRow } from '../src/ui/PickerRow';
import { DEFAULT_STRINGS as S } from '../src/strings';
import { act, mount, press } from './helpers/render';

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

import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_PLAN_MODE, getPlanMode, offeredOptions, setPlanMode } from '../src/planMode';
import { ChoiceSheet } from '../src/ui/ChoiceSheet';
import { PickerRow } from '../src/ui/PickerRow';
import { PullDownMenu } from '../src/ui/PullDown';

const offeredNow = () => getPlanMode() === 'subscription';
import { PremiumLock, PremiumTag } from '../src/ui/PremiumTag';
import { SettingRow } from '../src/ui/Row';
import { mount } from './helpers/render';

const texts = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => typeof n.type === 'string' && typeof n.props.children === 'string').map((n) => n.props.children as string);

describe('plan mode (9.0.0, 10.0.0)', () => {
  afterEach(() => setPlanMode('free'));

  it('is free by default, and only "subscription" turns selling on', () => {
    expect(DEFAULT_PLAN_MODE).toBe('free');
    expect(getPlanMode()).toBe('free');
    setPlanMode('subscription');
    expect(getPlanMode()).toBe('subscription');
    setPlanMode('other' as never);
    expect(getPlanMode()).toBe('free');
  });

  it('shares one value across copies of the store (the same global key)', () => {
    const g = globalThis as unknown as Record<symbol, { mode: string } | undefined>;
    setPlanMode('subscription');
    expect(g[Symbol.for('app-kits/plan-mode')]?.mode).toBe('subscription');
  });

  it('in free mode (10.0.0) hides every Premium mark and every Premium row', () => {
    const tag = mount(<PremiumTag />);
    expect(texts(tag)).not.toContain('PREMIUM');
    expect(mount(<PremiumLock />).root.toJSON()).toBeNull();
    expect(mount(<SettingRow icon="download" tint="#000" label="Data Export" premium onPress={() => undefined} />).root.toJSON()).toBeNull();
    expect(texts(mount(<SettingRow icon="download" tint="#000" label="Language" onPress={() => undefined} />))).toContain('Language');
    expect(offeredNow()).toBe(false);
  });

  it('in subscription mode draws a Premium row with its tag', () => {
    setPlanMode('subscription');
    const row = mount(<SettingRow icon="download" tint="#000" label="Data Export" premium onPress={() => undefined} />);
    expect(texts(row)).toContain('PREMIUM');
  });

  it('in free mode a menu, sheet and picker leave out locked options, except the chosen one, which shows without a padlock', () => {
    const options = [{ value: 'daily', label: 'Daily' }, { value: 'hourly', label: 'Hourly' }, { value: 'custom', label: 'Custom' }];
    const locked = (v: string) => v !== 'daily';
    const picker = mount(<PickerRow icon="repeat" tint="#000" label="Repeat" options={options} value="custom" onChange={() => undefined} locked={locked} style="sheet" />);
    expect(texts(picker)).toContain('Custom');
    const sheet = mount(<ChoiceSheet visible title="Repeat" options={options} value="custom" onChoose={() => undefined} onClose={() => undefined} locked={locked} />);
    expect(texts(sheet)).toEqual(expect.arrayContaining(['Daily', 'Custom']));
    expect(texts(sheet)).not.toContain('Hourly');
    expect(sheet.root.root.findAll((n) => n.type === 'Icon' && n.props.name === 'lock')).toHaveLength(0);
    const menu = mount(<PullDownMenu anchor={null} items={[{ id: 'a', label: 'Daily' }, { id: 'b', label: 'Hourly', locked: true }, { id: 'c', label: 'Custom', locked: true, checked: true }]} onPick={() => undefined} onClose={() => undefined} />);
    expect(texts(menu)).toEqual(expect.arrayContaining(['Daily', 'Custom']));
    expect(texts(menu)).not.toContain('Hourly');
    expect(menu.root.root.findAll((n) => n.type === 'Icon' && n.props.name === 'lock')).toHaveLength(0);
    expect(offeredOptions([1, 2, 3], true, () => true, () => false)).toEqual([1, 2, 3]);
    expect(offeredOptions([1, 2, 3], false, (n) => n > 1, (n) => n === 3)).toEqual([1, 3]);
  });
});

describe('planModeFrom (9.1.0)', () => {
  it('reads config/app: only "subscription" sells, and a tester list limits it to those accounts', async () => {
    const { planModeFrom } = await import('../src/planMode');
    expect(planModeFrom(undefined, 'u1')).toBe('free');
    expect(planModeFrom({ planMode: 'free' }, 'u1')).toBe('free');
    expect(planModeFrom({ planMode: 'subscription' }, 'u1')).toBe('subscription');
    expect(planModeFrom({ planMode: 'subscription', subscriptionTesters: ['u1'] }, 'u1')).toBe('subscription');
    expect(planModeFrom({ planMode: 'subscription', subscriptionTesters: ['u2'] }, 'u1')).toBe('free');
  });
});

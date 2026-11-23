import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_PLAN_MODE, getPlanMode, setPlanMode } from '../src/planMode';
import { PremiumLock, PremiumTag } from '../src/ui/PremiumTag';
import { SettingRow } from '../src/ui/Row';
import { mount } from './helpers/render';

const texts = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => typeof n.type === 'string' && typeof n.props.children === 'string').map((n) => n.props.children as string);

describe('plan mode (9.0.0)', () => {
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

  it('in free mode draws no Premium tag or padlock, and a premium row is an ordinary row', () => {
    const tag = mount(<PremiumTag />);
    expect(texts(tag)).not.toContain('PREMIUM');
    expect(mount(<PremiumLock />).root.toJSON()).toBeNull();
    const row = mount(<SettingRow icon="download" tint="#000" label="Data Export" premium onPress={() => undefined} />);
    expect(texts(row)).not.toContain('PREMIUM');
    const label = row.root.root.findAll((n) => typeof n.props.accessibilityLabel === 'string')[0]?.props.accessibilityLabel;
    expect(label).toBe('Data Export');
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

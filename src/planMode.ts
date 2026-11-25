/**
 * Whether a plan is on sale in this app. 10.2.0: the store is app-core-kit's single copy (`app-core-kit/shared`), under the
 * same global key as before, so this kit, app-subscriptions-kit and app-settings-kit all read one value.
 */
export { DEFAULT_PLAN_MODE, getPlanMode, offeredOptions, planModeFrom, setPlanMode, usePlanMode, usePremiumOffered } from 'app-core-kit/shared';
export type { PlanMode, PlanModeSource } from 'app-core-kit/shared';

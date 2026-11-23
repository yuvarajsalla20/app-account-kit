import { useSyncExternalStore } from 'react';

/**
 * 9.0.0: whether a plan is on sale in this app. `'free'` (the default) sells nothing: every feature is open to everyone, and
 * no Premium tag, padlock, crown or paywall shows. `'subscription'` shows today's Subscription page, Plans and locks.
 *
 * The owner chooses it per app with `planMode` in the Firestore document `config/app`; app-subscriptions-kit reads it and
 * sets it here. app-subscriptions-kit keeps an identical store under the same global key, so every kit reads one value
 * without depending on another kit.
 */
export type PlanMode = 'free' | 'subscription';

/** What every published app runs until the owner sets `planMode: "subscription"`. */
export const DEFAULT_PLAN_MODE: PlanMode = 'free';

interface PlanModeStore {
  mode: PlanMode;
  listeners: Set<() => void>;
}

const KEY = Symbol.for('app-kits/plan-mode');

const store = (): PlanModeStore => {
  const g = globalThis as unknown as Record<symbol, PlanModeStore | undefined>;
  return (g[KEY] ??= { mode: DEFAULT_PLAN_MODE, listeners: new Set() });
};

/** The plan mode now. */
export const getPlanMode = (): PlanMode => store().mode;

/** Sets the plan mode for every kit. Anything other than `'subscription'` is `'free'`. */
export function setPlanMode(mode: PlanMode): void {
  const s = store();
  const next: PlanMode = mode === 'subscription' ? 'subscription' : 'free';
  if (s.mode === next) return;
  s.mode = next;
  s.listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  const s = store();
  s.listeners.add(l);
  return () => {
    s.listeners.delete(l);
  };
};

/** The plan mode, kept in step. */
export function usePlanMode(): PlanMode {
  return useSyncExternalStore(subscribe, getPlanMode, getPlanMode);
}

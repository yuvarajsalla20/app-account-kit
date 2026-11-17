import { useMemo, useState, type ReactNode } from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { LookContext, type AccountComponents, type Look } from './look';
import { PlainCard } from './ui/Card';
import { DEFAULT_STRINGS, type AccountStrings } from './strings';
import type { AccountTheme } from './theme';

export type { AccountComponents } from './look';

const DEFAULT_COMPONENTS: AccountComponents = { Text: RNText, TextInput: RNTextInput, Card: PlainCard };

interface ProviderProps {
  /** Required: the kit has no colors of its own. */
  theme: AccountTheme;
  strings?: Partial<AccountStrings>;
  components?: Partial<AccountComponents>;
  children: ReactNode;
}

/** Gives every piece below it the app's colors, wording and text components. */
export function AccountProvider({ theme: themeProp, strings: stringsProp, components: componentsProp, children }: ProviderProps) {
  // Apps often pass these inline (a new object on each render): compare their contents, so every row below does not
  // rebuild its styles and redraw.
  const theme = useShallowStable(themeProp);
  const strings = useShallowStable(stringsProp);
  const components = useShallowStable(componentsProp);
  const look = useMemo<Look>(
    () => ({ theme, strings: { ...DEFAULT_STRINGS, ...strings }, components: { ...DEFAULT_COMPONENTS, ...components } }),
    [theme, strings, components],
  );
  return <LookContext.Provider value={look}>{children}</LookContext.Provider>;
}

/** Keeps the same object while its own values are the same. */
export function useShallowStable<T extends object | undefined>(value: T): T {
  const [kept, setKept] = useState(value);
  const same = kept === value || (!!kept && !!value && shallowEqual(kept, value));
  if (!same) setKept(value);
  return same ? kept : value;
}

const shallowEqual = (a: object, b: object): boolean => {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
};

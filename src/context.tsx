import { useMemo, type ReactNode } from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { LookContext, type AccountComponents, type Look } from './look';
import { PlainCard } from './ui/Card';
import { PlainHeader } from './ui/Header';
import { DEFAULT_STRINGS, type AccountStrings } from './strings';
import type { AccountTheme } from './theme';

export type { AccountComponents } from './look';

const DEFAULT_COMPONENTS: AccountComponents = { Text: RNText, TextInput: RNTextInput, Card: PlainCard, Header: PlainHeader };

interface ProviderProps {
  /** Required: the kit has no colors of its own. */
  theme: AccountTheme;
  strings?: Partial<AccountStrings>;
  components?: Partial<AccountComponents>;
  children: ReactNode;
}

/** Gives every piece below it the app's colors, wording and text components. */
export function AccountProvider({ theme, strings, components, children }: ProviderProps) {
  const look = useMemo<Look>(
    () => ({ theme, strings: { ...DEFAULT_STRINGS, ...strings }, components: { ...DEFAULT_COMPONENTS, ...components } }),
    [theme, strings, components],
  );
  return <LookContext.Provider value={look}>{children}</LookContext.Provider>;
}

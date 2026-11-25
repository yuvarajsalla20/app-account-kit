import { useShallowStable } from 'app-core-kit/shared';
import { useMemo, type ReactNode } from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { LookContext, type AccountComponents, type Look, type PickerStyle } from './look';
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
  /** 7.26.0: 'pullDown' turns every PickerRow below into a grey value pill with a pull-down menu. Default 'sheet'. */
  pickers?: PickerStyle;
  children: ReactNode;
}

/** Gives every piece below it the app's colors, wording and text components. */
export function AccountProvider({ theme: themeProp, strings: stringsProp, components: componentsProp, pickers = 'sheet', children }: ProviderProps) {
  // Apps often pass these inline (a new object on each render): compare their contents, so every row below does not
  // rebuild its styles and redraw.
  const theme = useShallowStable(themeProp);
  const strings = useShallowStable(stringsProp);
  const components = useShallowStable(componentsProp);
  const look = useMemo<Look>(
    () => ({ theme, strings: { ...DEFAULT_STRINGS, ...strings }, components: { ...DEFAULT_COMPONENTS, ...components }, pickers }),
    [theme, strings, components, pickers],
  );
  return <LookContext.Provider value={look}>{children}</LookContext.Provider>;
}

/** 10.1.0: app-core-kit's single copy, still exported here for kits that read it from app-account-kit. */
export { useShallowStable };

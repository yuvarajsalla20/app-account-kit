import { createContext, useContext, useMemo, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { StyleSheet, Text as RNText, TextInput as RNTextInput, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import { DEFAULT_STRINGS, type AccountStrings } from './strings';
import { DEFAULT_THEME, type AccountTheme } from './theme';

/** The app's own text components, so the screen picks up its fonts. Plain React Native ones are the default. */
export interface AccountComponents {
  Text: ComponentType<ComponentProps<typeof RNText>>;
  TextInput: ComponentType<ComponentProps<typeof RNTextInput>>;
}

const DEFAULT_COMPONENTS: AccountComponents = { Text: RNText, TextInput: RNTextInput };

interface Look {
  theme: AccountTheme;
  strings: AccountStrings;
  components: AccountComponents;
}

const LookContext = createContext<Look>({ theme: DEFAULT_THEME, strings: DEFAULT_STRINGS, components: DEFAULT_COMPONENTS });

interface ProviderProps {
  theme?: Partial<AccountTheme>;
  strings?: Partial<AccountStrings>;
  components?: Partial<AccountComponents>;
  children: ReactNode;
}

/** Gives every piece below it the app's colors, wording and text components. */
export function AccountProvider({ theme, strings, components, children }: ProviderProps) {
  const look = useMemo<Look>(
    () => ({ theme: { ...DEFAULT_THEME, ...theme }, strings: { ...DEFAULT_STRINGS, ...strings }, components: { ...DEFAULT_COMPONENTS, ...components } }),
    [theme, strings, components],
  );
  return <LookContext.Provider value={look}>{children}</LookContext.Provider>;
}

export const useLook = (): Look => useContext(LookContext);

/** Styles that depend on the theme, built once per theme: `const styles = useStyles((t) => ({ box: { color: t.text } }))`. */
type Styles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export const useStyles = <T extends Styles>(make: (theme: AccountTheme) => T): T => {
  const { theme } = useLook();
  // `make` is a module-level function in every caller, so the theme is the only thing that changes the result.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => StyleSheet.create(make(theme)), [theme]);
};

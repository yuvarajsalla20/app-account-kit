import { createContext, useContext, useMemo, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { StyleSheet, Text as RNText, TextInput as RNTextInput, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import { PlainCard } from './ui/Card';
import { PlainHeader } from './ui/Header';
import { DEFAULT_STRINGS, type AccountStrings } from './strings';
import type { AccountTheme } from './theme';

/** The app's own text components, so the screen picks up its fonts. Plain React Native ones are the default. */
export interface AccountComponents {
  Text: ComponentType<ComponentProps<typeof RNText>>;
  TextInput: ComponentType<ComponentProps<typeof RNTextInput>>;
  /** Draws every card (a group of rows). Gets the corner radius to use. Default: the theme's fill and edge. */
  Card: ComponentType<{ children: ReactNode; radius: number }>;
  /** Draws the title and back arrow at the top of every page. Default: a plain arrow and title. */
  Header: ComponentType<{ title: string; onBack: () => void; backLabel: string }>;
}

const DEFAULT_COMPONENTS: AccountComponents = { Text: RNText, TextInput: RNTextInput, Card: PlainCard, Header: PlainHeader };

interface Look {
  theme: AccountTheme;
  strings: AccountStrings;
  components: AccountComponents;
}

const LookContext = createContext<Look | null>(null);

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

export const useLook = (): Look => {
  const look = useContext(LookContext);
  if (!look) throw new Error('app-account-kit: render this inside <AccountScreen theme={...}> or <AccountProvider theme={...}>.');
  return look;
};

/** Styles that depend on the theme, built once per theme: `const styles = useStyles((t) => ({ box: { color: t.text } }))`. */
type Styles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export const useStyles = <T extends Styles>(make: (theme: AccountTheme) => T): T => {
  const { theme } = useLook();
  // `make` is a module-level function in every caller, so the theme is the only thing that changes the result.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => StyleSheet.create(make(theme)), [theme]);
};

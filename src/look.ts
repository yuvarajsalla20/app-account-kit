import { createContext, useContext, useMemo, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { StyleSheet, type Text as RNText, type TextInput as RNTextInput, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import type { AccountStrings } from './strings';
import type { AccountTheme } from './theme';

/** The app's own text components, so the screen picks up its fonts. Plain React Native ones are the default. */
export interface AccountComponents {
  Text: ComponentType<ComponentProps<typeof RNText>>;
  TextInput: ComponentType<ComponentProps<typeof RNTextInput>>;
  /** Draws every card (a group of rows). Gets the corner radius to use. Default: the theme's fill and edge. */
  Card: ComponentType<{ children: ReactNode; radius: number }>;
  /** Optional: the app's own Back button, drawn on every page in place of the kit's arrow and word. `label` is what VoiceOver says. Default: the kit's Back. */
  BackButton?: ComponentType<{ onPress: () => void; label: string }>;
  /** Optional: wraps the whole screen so a swipe from the left edge goes back. `onBack` steps back one page, the same as the Back button (from the main list it calls the app's `onBack`). Default: no swipe. */
  EdgeSwipe?: ComponentType<{ onBack: () => void; children: ReactNode }>;
}

export interface Look {
  theme: AccountTheme;
  strings: AccountStrings;
  components: AccountComponents;
}

/** Filled by `AccountProvider` (context.tsx). Lives here so the pieces that read it never import the provider. */
export const LookContext = createContext<Look | null>(null);

export const useLook = (): Look => {
  const look = useContext(LookContext);
  if (!look) throw new Error('app-account-kit: render this inside <SettingsScreen theme={...}> or <AccountProvider theme={...}>.');
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

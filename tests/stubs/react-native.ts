import { createElement, forwardRef } from 'react';

// A tiny stand-in for react-native so the real screens can be rendered in tests: every component is a plain named element.
const host = (name: string) => forwardRef<unknown, Record<string, unknown>>((props, ref) => createElement(name, { ...props, ref }, props.children as never));

export const View = host('View');
export const Text = host('Text');
export const TextInput = host('TextInput');
export const Pressable = host('Pressable');
export const ScrollView = host('ScrollView');
export const Switch = host('Switch');
export const Image = host('Image');
// A real Modal draws nothing while it is closed.
export const Modal = (props: { visible?: boolean; children?: unknown }) => (props.visible ? createElement('Modal', props as never, props.children as never) : null);
export const ActivityIndicator = host('ActivityIndicator');
export const StyleSheet = { create: <T,>(styles: T): T => styles };
export const Platform = { OS: 'ios', Version: '18' };
export const Keyboard = { dismiss: () => {} };
export const findNodeHandle = () => 1;
export const calls = { focused: 0, announced: [] as string[] };
export const AccessibilityInfo = {
  setAccessibilityFocus: () => void (calls.focused += 1),
  announceForAccessibility: (text: string) => void calls.announced.push(text),
};
export const BackHandler = { addEventListener: () => ({ remove: () => {} }) };
export const Linking = { openURL: async () => true };
export const Share = { share: async () => ({}) };

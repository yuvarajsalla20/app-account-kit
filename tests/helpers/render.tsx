import type { ReactElement, ReactNode } from 'react';
import TestRenderer, { act, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { AccountProvider } from '../../src/context';
import { useAction, type ActionRunner } from '../../src/hooks/useAction';
import { THEME } from './theme';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** The labels of the boxes that were asked to take focus, in order. */
export const focused: string[] = [];
const nodeMock = (el: { props: Record<string, unknown> }) => ({ focus: () => void focused.push(String(el.props.accessibilityLabel)), scrollTo: () => {}, scrollToEnd: () => {} });
const wrap = (ui: ReactElement) => <AccountProvider theme={THEME}>{ui}</AccountProvider>;

/** Renders inside the provider and returns helpers to find boxes and buttons by what the person sees. */
export const mount = (ui: ReactElement) => {
  let root!: ReactTestRenderer;
  act(() => {
    root = TestRenderer.create(wrap(ui), { createNodeMock: nodeMock });
  });
  const find = (label: string) => root.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.type === 'string');
  return {
    root,
    /** The one box or button with this label. */
    byLabel: (label: string): ReactTestInstance => find(label)[0]!,
    /** The pressable that holds this visible text (for parts that have no label of their own). */
    byText: (text: string): ReactTestInstance => {
      let node: ReactTestInstance | null = root.root.findAll((n) => typeof n.type === 'string' && n.props.children === text)[0] ?? null;
      while (node && !node.props.onPress) node = node.parent;
      return node!;
    },
    has: (label: string): boolean => find(label).length > 0,
    rerender: (next: ReactElement) => act(() => root.update(wrap(next))),
    unmount: () => act(() => root.unmount()),
  };
};

/** Types into a box. */
export const type = (box: ReactTestInstance, text: string) => act(() => void box.props.onChangeText(text));
/** Presses a button and waits for what it started to finish. */
export const press = (button: ReactTestInstance) => act(async () => void button.props.onPress());
/** Leaves a box (blur) and waits for what that started. */
export const blur = (box: ReactTestInstance) => act(async () => void box.props.onBlur());
/** Presses Done on the keyboard in a box. */
export const submit = (box: ReactTestInstance) => act(async () => void box.props.onSubmitEditing());

interface Options {
  onError?: (where: string, error: unknown) => void;
  describeError?: (error: unknown) => string | null | undefined;
  timeoutMs?: number;
  tookTooLong?: string;
}

/** Renders a part that needs the shared runner, and keeps hold of the runner so a test can read the note and busy flag. */
export const withAction = (render: (action: ActionRunner) => ReactNode, options: Options = {}) => {
  const held: { action: ActionRunner } = { action: undefined as never };
  function Runner() {
    held.action = useAction(options.onError, options.describeError, options.timeoutMs, options.tookTooLong);
    return <>{render(held.action)}</>;
  }
  return { ...mount(<Runner />), held };
};
export { act };

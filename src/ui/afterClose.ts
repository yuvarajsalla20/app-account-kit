import { useRef } from 'react';
import { Platform } from 'react-native';

/**
 * How long to wait for a closing Modal before running what was picked anyway (ms). On iPhone the Modal's own `onDismiss`
 * usually comes first; this covers a Modal that was taken away instead of closed, where `onDismiss` never comes.
 */
export const AFTER_CLOSE_FALLBACK_MS = 700;

/**
 * Runs a pick only once the Modal it came from has gone (7.29.0): on iPhone a share sheet asked for while a Modal is still
 * fading out is often not shown at all. Pass `onDismiss` to the Modal and call `later(fn)` right after closing it. iPhone runs `fn` from
 * `onDismiss`, with a timer as a fallback; other platforms run it on the next tick. `fn` runs once.
 */
export function useAfterClose() {
  const pending = useRef<(() => void) | null>(null);
  const later = (fn: () => void) => {
    let done = false;
    const once = () => {
      if (done) return;
      done = true;
      if (pending.current === once) pending.current = null;
      fn();
    };
    pending.current = once;
    setTimeout(once, Platform.OS === 'ios' ? AFTER_CLOSE_FALLBACK_MS : 0);
  };
  const onDismiss = () => pending.current?.();
  return { later, onDismiss };
}

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Hydration-safe mount detection hook using React 19 useSyncExternalStore
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

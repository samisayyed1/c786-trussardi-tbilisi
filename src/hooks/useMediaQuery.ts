import { useSyncExternalStore } from 'react';

/**
 * Subscribes to a media query. Used to switch off parallax and rotation on
 * small screens rather than merely hiding their visual effect.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void): (() => void) => {
    if (typeof window === 'undefined' || !window.matchMedia) return () => {};
    const list = window.matchMedia(query);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  };

  const getSnapshot = (): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Matches the Tailwind `lg` breakpoint, where the desktop compositions begin. */
export const useIsDesktop = (): boolean => useMediaQuery('(min-width: 1024px)');

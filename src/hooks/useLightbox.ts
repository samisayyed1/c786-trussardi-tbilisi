import { useState } from 'react';

/** Open/close/index plumbing for the shared fullscreen media viewer. */
export function useLightbox() {
  const [index, setIndex] = useState<number | null>(null);

  return {
    index,
    open: (next: number) => setIndex(next),
    close: () => setIndex(null),
    setIndex,
  };
}

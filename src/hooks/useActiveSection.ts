import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently in view, for navigation highlighting.
 *
 * Uses a single IntersectionObserver over all sections and picks the entry with
 * the greatest visible ratio, which behaves correctly when a short section sits
 * fully inside the viewport alongside a taller neighbour.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestId: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        // Keep the last active link lit rather than flickering to nothing
        // while scrolling through an unobserved gap.
        if (bestId !== null) setActive(bestId);
      },
      {
        // Discount the area under the floating nav so a section only counts
        // as active once it is genuinely the one being read.
        rootMargin: '-20% 0px -35% 0px',
        threshold: [0, 0.15, 0.3, 0.5, 0.75, 1],
      },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

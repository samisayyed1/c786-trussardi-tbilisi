import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  /** Fires once and then stops observing. */
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Reports whether an element has entered the viewport.
 *
 * A deliberately small alternative to a full animation library for the one
 * behaviour this page needs from it: reveal-on-scroll. The observer is
 * disconnected as soon as it has fired, so long pages do not accumulate
 * hundreds of live observers.
 */
export function useInView<T extends HTMLElement>({
  once = true,
  rootMargin = '0px 0px -12% 0px',
  threshold = 0,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Without IntersectionObserver, show everything rather than nothing.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, inView };
}

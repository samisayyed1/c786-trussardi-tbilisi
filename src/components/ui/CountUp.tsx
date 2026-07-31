import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CountUpProps {
  to: number;
  suffix?: string;
  durationMs?: number;
}

/**
 * Counts a genuine numeric fact up once it enters view.
 *
 * Only used where the underlying figure is real; the final value is what gets
 * rendered for reduced-motion users and before the animation starts.
 */
export function CountUp({ to, suffix = '', durationMs = 1100 }: CountUpProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(reducedMotion ? to : 0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(to);
      return;
    }

    const element = ref.current;
    if (!element) return;

    let frame = 0;
    let started = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((entry) => entry.isIntersecting)) return;
        started = true;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number): void => {
          const ratio = Math.min((now - start) / durationMs, 1);
          // Ease-out cubic: quick to establish the number, gentle to land on it.
          setValue(Math.round(to * (1 - Math.pow(1 - ratio, 3))));
          if (ratio < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, durationMs, reducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

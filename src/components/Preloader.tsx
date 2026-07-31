import { useEffect, useRef, useState } from 'react';
import { BRAND } from '../content/site';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { markIntroPlayed } from '../lib/intro';

const WORDS = ['Tbilisi', 'Trussardi', 'Mira Verde'] as const;

/**
 * Run time. Held at the short end of the brief's 1.4–2s window: every extra
 * millisecond here is a millisecond added directly to Largest Contentful Paint,
 * because nothing behind the overlay can count as painted.
 */
const DURATION_MS = 1400;
const EXIT_MS = 560;

interface PreloaderProps {
  /**
   * Fires as the overlay *starts* leaving, not after. The hero entrance then
   * plays behind the departing overlay rather than queueing after it, which
   * keeps roughly half a second out of LCP while looking better besides.
   */
  onExitStart: () => void;
  /** Fires once the overlay is fully gone and can be unmounted. */
  onFinished: () => void;
}

/**
 * Cinematic first-visit loading screen.
 *
 * Runs once per session, respects reduced motion by resolving immediately, and
 * never adds artificial delay: the counter is driven by elapsed time and the
 * overlay leaves as soon as it completes.
 */
export function Preloader({ onExitStart, onFinished }: PreloaderProps) {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const settled = useRef(false);

  useEffect(() => markIntroPlayed(), []);

  // Reduced motion: skip the sequence entirely rather than replay it slowly.
  useEffect(() => {
    if (!reducedMotion || settled.current) return;
    settled.current = true;
    onExitStart();
    onFinished();
  }, [reducedMotion, onExitStart, onFinished]);

  useEffect(() => {
    if (reducedMotion) return;

    let frame = 0;
    let exitTimer = 0;
    const start = performance.now();

    const tick = (now: number): void => {
      const elapsed = now - start;
      const ratio = Math.min(elapsed / DURATION_MS, 1);
      // Ease-out so the count decelerates into 100 instead of stopping dead.
      const eased = 1 - Math.pow(1 - ratio, 2.2);

      setProgress(Math.round(eased * 100));
      setWordIndex(Math.min(WORDS.length - 1, Math.floor(ratio * WORDS.length)));

      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }

      if (settled.current) return;
      settled.current = true;

      setLeaving(true);
      // Hero animates in immediately, behind the overlay as it slides away.
      onExitStart();
      exitTimer = window.setTimeout(onFinished, EXIT_MS);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
    };
  }, [reducedMotion, onExitStart, onFinished]);

  if (reducedMotion) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`fixed inset-0 z-[100] flex flex-col justify-between bg-[hsl(var(--bg))] px-5 py-6 transition-all duration-[620ms] ease-[cubic-bezier(0.76,0,0.24,1)] md:px-10 md:py-8 ${
        leaving ? 'pointer-events-none translate-y-[-101%]' : 'translate-y-0'
      }`}
    >
      <p className="text-[0.6875rem] font-medium tracking-[0.28em] text-[hsl(var(--text))] uppercase">
        {BRAND.wordmark} {BRAND.wordmarkSuffix}
      </p>

      <div className="flex items-center justify-center overflow-hidden" aria-hidden="true">
        <span
          key={wordIndex}
          className="font-display block text-[clamp(2.5rem,11vw,6rem)] text-[hsl(var(--text))]"
          style={{ animation: 'preloader-word 520ms cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {WORDS[wordIndex]}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-right font-mono text-[0.6875rem] tracking-[0.2em] text-[hsl(var(--muted))] tabular-nums">
          {String(progress).padStart(3, '0')}
        </p>
        <div className="h-px w-full bg-[hsl(var(--stroke))]">
          <div
            className="accent-gradient h-full origin-left"
            style={{ transform: `scaleX(${progress / 100})`, transition: 'transform 90ms linear' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes preloader-word {
          from { opacity: 0; transform: translateY(38%); filter: blur(7px); }
          to   { opacity: 1; transform: translateY(0);   filter: blur(0); }
        }
      `}</style>
    </div>
  );
}

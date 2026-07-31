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

/**
 * Exit slide. Single source of truth — this drives both the CSS transition and
 * the unmount timer. They previously disagreed (620ms of animation, unmounted
 * after 560ms), so the overlay was torn away mid-slide and the last frames
 * simply vanished.
 */
const EXIT_MS = 620;

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
 *
 * The progress bar and counter are written straight to the DOM from the
 * animation frame rather than held in React state. Re-rendering this component
 * sixty-plus times a second was enough to drop frames on a phone, and the bar
 * additionally carried a CSS transition that restarted on every one of those
 * frames — the two fought each other and the result visibly stuttered.
 */
export function Preloader({ onExitStart, onFinished }: PreloaderProps) {
  const reducedMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const settled = useRef(false);

  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);

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
    let lastShownCount = -1;
    const start = performance.now();

    const tick = (now: number): void => {
      const ratio = Math.min((now - start) / DURATION_MS, 1);
      // Ease-out so the count decelerates into 100 instead of stopping dead.
      const eased = 1 - Math.pow(1 - ratio, 2.2);

      // Unrounded scale: the bar moves continuously instead of stepping in
      // whole percent increments, which is what made it look ratchety.
      if (barRef.current) barRef.current.style.transform = `scaleX(${eased})`;

      // The counter is text, so it does round — but only touch the DOM when the
      // displayed value actually changes.
      const count = Math.round(eased * 100);
      if (count !== lastShownCount && counterRef.current) {
        counterRef.current.textContent = String(count).padStart(3, '0');
        lastShownCount = count;
      }

      const nextWord = Math.min(WORDS.length - 1, Math.floor(ratio * WORDS.length));
      setWordIndex((current) => (current === nextWord ? current : nextWord));

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
      // transition-transform, not transition-all: there is no reason to watch
      // every animatable property, and doing so invites unrelated repaints.
      className={`fixed inset-0 z-[100] flex flex-col justify-between bg-[hsl(var(--bg))] px-5 py-6 transition-transform ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform md:px-10 md:py-8 ${
        leaving ? 'pointer-events-none -translate-y-full' : 'translate-y-0'
      }`}
      style={{ transitionDuration: `${EXIT_MS}ms` }}
    >
      <p className="text-[0.6875rem] font-medium tracking-[0.28em] text-[hsl(var(--text))] uppercase">
        {BRAND.wordmark} {BRAND.wordmarkSuffix}
      </p>

      <div className="flex items-center justify-center overflow-hidden" aria-hidden="true">
        <span
          key={wordIndex}
          className="font-display block text-[clamp(2.5rem,11vw,6rem)] text-[hsl(var(--text))] will-change-[transform,opacity]"
          style={{ animation: 'preloader-word 520ms cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {WORDS[wordIndex]}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <p
          ref={counterRef}
          className="text-right font-mono text-[0.6875rem] tracking-[0.2em] text-[hsl(var(--muted))] tabular-nums"
        >
          000
        </p>
        <div className="h-px w-full bg-[hsl(var(--stroke))]">
          {/* No CSS transition here on purpose — this is written every frame. */}
          <div
            ref={barRef}
            className="accent-gradient h-full origin-left will-change-transform"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes preloader-word {
          from { opacity: 0; transform: translate3d(0, 38%, 0); filter: blur(7px); }
          to   { opacity: 1; transform: translate3d(0, 0, 0);   filter: blur(0); }
        }
      `}</style>
    </div>
  );
}

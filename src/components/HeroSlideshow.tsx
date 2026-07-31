import { useEffect, useState } from 'react';
import { HERO_MEDIA } from '../content/media-manifest';
import { Picture } from './ui/Picture';
import { useReducedMotion } from '../hooks/useReducedMotion';

/** How long each slide holds before the next begins fading in. */
const HOLD_MS = 6000;

/** Crossfade length. Long and slow — this should read as a dissolve, not a cut. */
const FADE_MS = 1600;

/**
 * Cinematic crossfading background for the hero.
 *
 * Only the first slide is mounted initially. The rest are attached after the
 * window load event, because an image inside the viewport loads immediately
 * regardless of `loading="lazy"` — mounting all five up front would put four
 * unnecessary downloads directly in front of the Largest Contentful Paint.
 *
 * With reduced motion the first slide simply stays put; nothing cycles and no
 * extra images are ever fetched.
 */
export function HeroSlideshow() {
  const reducedMotion = useReducedMotion();
  const [armed, setArmed] = useState(false);
  const [active, setActive] = useState(0);

  // Defer the remaining slides until the critical work is done.
  useEffect(() => {
    if (reducedMotion || HERO_MEDIA.length < 2) return;

    let idle = 0;
    const arm = (): void => {
      // A further beat after load, so decoding never competes with the hero
      // entrance animation.
      idle = window.setTimeout(() => setArmed(true), 600);
    };

    if (document.readyState === 'complete') {
      arm();
      return () => window.clearTimeout(idle);
    }

    window.addEventListener('load', arm, { once: true });
    return () => {
      window.removeEventListener('load', arm);
      window.clearTimeout(idle);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!armed || reducedMotion || HERO_MEDIA.length < 2) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % HERO_MEDIA.length);
    }, HOLD_MS);

    return () => window.clearInterval(timer);
  }, [armed, reducedMotion]);

  // Mount slides one ahead of where the sequence has reached, rather than all
  // at once. Attaching four extra images together put their decodes in a single
  // burst and measurably raised total blocking time on mobile; drip-feeding them
  // spreads that cost over the sequence while still giving each slide a full
  // hold to load before it is needed. The count only ever grows, so wrapping
  // back to the first slide never unmounts anything.
  const [mountedCount, setMountedCount] = useState(1);

  useEffect(() => {
    if (!armed || reducedMotion) return;
    setMountedCount((current) => Math.max(current, Math.min(active + 2, HERO_MEDIA.length)));
  }, [armed, active, reducedMotion]);

  const slides = reducedMotion ? HERO_MEDIA.slice(0, 1) : HERO_MEDIA.slice(0, mountedCount);

  return (
    <>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          /* Slide 0 carries the description at all times; the others are
             decorative repeats of the same subject, so hiding them keeps the
             hero described no matter which frame is currently showing. */
          aria-hidden={index === 0 ? undefined : 'true'}
          className="absolute inset-0 transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
          style={{
            opacity: index === active ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
            // Keep every slide on its own layer so a crossfade never repaints
            // the ones underneath.
            willChange: 'opacity',
          }}
        >
          <Picture
            asset={slide}
            priority={index === 0}
            sizes="100vw"
            className="h-full w-full"
            imgClassName="object-cover object-center"
            /* Only the first slide carries the description; the rest are the
               same subject and would just repeat it to a screen reader. */
            altOverride={index === 0 ? undefined : ''}
          />
        </div>
      ))}
    </>
  );
}

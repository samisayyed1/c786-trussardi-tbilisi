import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { HERO_COPY, HERO_FACTS } from '../content/site';
import { HeroSlideshow } from './HeroSlideshow';
import { PrimaryCta, WhatsAppCta } from './ui/Cta';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  /** Held until the intro overlay has left, so the entrance is actually seen. */
  ready: boolean;
}

/**
 * Full-viewport cinematic hero over the strongest official exterior render.
 *
 * No project video is published by the developer, so this is a still image with
 * a slow GSAP scale — never an unrelated stock video.
 */
export function Hero({ ready }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ready || reducedMotion) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // fromTo, not from: both ends are stated explicitly, so a re-run can never
      // capture an already-animated value as the target and strand an element
      // at opacity 0.
      // Durations are kept tight on purpose. The headline and supporting copy
      // are the Largest Contentful Paint candidates, so every extra tenth of a
      // second spent fading them in is a tenth added to the measured LCP.
      timeline
        .fromTo('[data-hero="line"]', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.75, stagger: 0.08 })
        .fromTo(
          '[data-hero="copy"]',
          { opacity: 0, y: 24, filter: 'blur(7px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55 },
          '-=0.55',
        )
        .fromTo(
          '[data-hero="cta"] > *',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 },
          '-=0.3',
        )
        .fromTo(
          '[data-hero="fact"]',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 },
          '-=0.25',
        )
        .fromTo('[data-hero="scroll"]', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2');

      // A very slow push-in on the still, so the frame never feels frozen.
      gsap.to(mediaRef.current, {
        scale: 1.09,
        ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, rootRef);

    // Disposes the timeline and every ScrollTrigger created inside the context.
    return () => context.revert();
  }, [ready, reducedMotion]);

  return (
    <section
      id="top"
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pt-28 pb-10 md:pb-14"
    >
      <div ref={mediaRef} className="absolute inset-0 -z-10 will-change-transform">
        {/* Five renders crossfading. Phones get art-directed portrait sources
            for each (see media.config); the landscape originals compose badly
            in a tall viewport. */}
        <HeroSlideshow />
      </div>

      {/* Multi-stop cinematic ramp — see `hero-scrim` in index.css for why a
          three-stop utility gradient was not enough here. */}
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

      <div className="shell">
        <h1 className="max-w-4xl text-[clamp(2rem,7.6vw,5.5rem)] [text-shadow:0_2px_30px_rgb(0_0_0/0.55)] sm:[text-shadow:none]">
          <span data-hero="line" className="block">
            Italian-Branded Living
          </span>
          <span data-hero="line" className="block">
            Arrives in <span className="font-display accent-text">Tbilisi</span>
          </span>
        </h1>

        {/* Only one of these is ever displayed; the other is display:none, so
            it is not announced by assistive tech either. */}
        <p
          data-hero="copy"
          className="mt-5 max-w-xl text-[0.9375rem] text-white/85 [text-shadow:0_1px_18px_rgb(0_0_0/0.5)] sm:mt-6 sm:text-base sm:[text-shadow:none]"
        >
          <span className="sm:hidden">{HERO_COPY.short}</span>
          <span className="hidden sm:inline">{HERO_COPY.full}</span>
        </p>

        <div data-hero="cta" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <PrimaryCta href="#enquire" event="hero_primary_cta_click" className="w-full sm:w-auto">
            Get Prices &amp; Availability
          </PrimaryCta>
          <WhatsAppCta event="hero_whatsapp_click" className="w-full sm:w-auto" />
        </div>

        {/* Three facts on a phone, all five once there is width for them. The
            value leads at display size with the label beneath — an editorial
            line separated by hairlines, not a boxed spec bar. */}
        {/* Centred on phones, where the three facts read as one balanced band;
            left-aligned from `sm` up so they sit on the same axis as the
            headline and copy. Note `sm:first:pl-0` rather than `first:pl-0` —
            stripping the first cell's padding on mobile would push the whole
            group off centre. */}
        <dl className="mt-9 flex items-start justify-center sm:mt-12 sm:flex-wrap sm:justify-start sm:gap-y-6 md:mt-14">
          {HERO_FACTS.map((fact) => (
            <div
              data-hero="fact"
              key={fact.label}
              className={`min-w-0 border-l border-white/15 px-3 text-center first:border-l-0 sm:px-7 sm:text-left sm:first:pl-0 ${
                fact.compact ? '' : 'hidden sm:block'
              }`}
            >
              <dd className="text-[1.0625rem] leading-none font-light tracking-tight text-[hsl(var(--text))] sm:text-[1.625rem]">
                {fact.value}
              </dd>
              <dt className="mt-2 text-[0.5625rem] tracking-[0.16em] text-white/70 uppercase sm:mt-2.5 sm:text-[0.625rem] sm:tracking-[0.18em] sm:text-white/58">
                {fact.label}
                {fact.note ? <span className="ml-1.5 hidden normal-case sm:inline">· {fact.note}</span> : null}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      <a
        data-hero="scroll"
        href="#overview"
        aria-label="Scroll to overview"
        className="absolute right-5 bottom-8 hidden size-11 place-items-center rounded-full border border-[hsl(var(--stroke))] text-[hsl(var(--muted))] transition-colors hover:border-[hsl(var(--accent-start))] hover:text-[hsl(var(--text))] md:grid lg:right-10"
      >
        <ArrowDown aria-hidden="true" className="size-4 motion-safe:animate-bounce" />
      </a>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PAYMENT_PLAN, PAYMENT_PLAN_NOTE, PROJECT } from '../content/site';
import { Reveal } from './ui/Reveal';
import { Eyebrow, Section, SectionHeading } from './ui/Section';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useIsDesktop } from '../hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

const DURING_CONSTRUCTION = PAYMENT_PLAN.filter((milestone) => milestone.title !== 'On completion').reduce(
  (total, milestone) => total + milestone.percent,
  0,
);

/**
 * Payment plan timeline.
 *
 * Desktop draws a progress rail that fills as the section scrolls; mobile gets a
 * plain vertical timeline with no scroll hijacking. Reduced motion shows the
 * rail already complete.
 */
export function PaymentPlan() {
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (reducedMotion || !isDesktop || !railRef.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        railRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            // Scrubbed, never pinned — the section must not trap the scroll.
            start: 'top 70%',
            end: 'bottom 75%',
            scrub: 0.4,
          },
        },
      );
    }, rootRef);

    return () => context.revert();
  }, [reducedMotion, isDesktop]);

  return (
    <Section surface aria-labelledby="payment-heading">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <Eyebrow>Payment plan</Eyebrow>
              <SectionHeading id="payment-heading" className="mt-6">
                {PROJECT.paymentPlanLabel} <span className="font-display">Across Construction</span>
              </SectionHeading>
              <p className="mt-6 text-[hsl(var(--muted))]">
                {DURING_CONSTRUCTION}% is spread across six instalments during construction, with the remaining 40%
                falling due on completion in {PROJECT.handover}.
              </p>

              <dl className="mt-8 space-y-4 border-t border-[hsl(var(--stroke))] pt-6">
                <div>
                  <dt className="text-[0.625rem] tracking-[0.16em] text-[hsl(var(--muted))] uppercase">
                    Expression of interest
                  </dt>
                  <dd className="mt-1 text-lg text-[hsl(var(--text))]">{PROJECT.eoi}</dd>
                  <dd className="mt-1 text-xs text-[hsl(var(--muted))]">{PROJECT.eoiNote}</dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <div ref={rootRef} className="lg:col-span-8">
            {/* Positioned wrapper scoped to the timeline, so the rail stops at the
                final milestone rather than running on into the footnote. */}
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute top-2 bottom-2 left-[0.5625rem] w-px bg-[hsl(var(--stroke))] md:left-[0.6875rem]"
              />
              <span
                ref={railRef}
                aria-hidden="true"
                className="accent-gradient absolute top-2 bottom-2 left-[0.5625rem] w-px origin-top md:left-[0.6875rem]"
                style={{ transform: reducedMotion || !isDesktop ? 'scaleY(1)' : 'scaleY(0)' }}
              />

              <ol className="space-y-0">
              {PAYMENT_PLAN.map((milestone, position) => {
                const isFinal = position === PAYMENT_PLAN.length - 1;
                return (
                  <Reveal as="li" key={`${milestone.title}-${milestone.timing}`} delay={position * 0.05}>
                    <div className="relative flex items-start gap-5 border-b border-[hsl(var(--stroke))] py-5 pl-9 last:border-b-0 md:gap-8 md:pl-12">
                      <span
                        aria-hidden="true"
                        className={`absolute top-[1.6rem] left-1 size-[0.6875rem] rounded-full ring-4 ring-[hsl(var(--surface))] md:left-1.5 ${
                          isFinal ? 'accent-gradient' : 'bg-[hsl(var(--muted))]'
                        }`}
                      />
                      <span
                        className={`w-16 shrink-0 text-2xl leading-none md:w-20 md:text-3xl ${
                          isFinal ? 'accent-text' : 'text-[hsl(var(--text))]'
                        }`}
                      >
                        {milestone.percent}%
                      </span>
                      <span className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                        <span className="text-[hsl(var(--text))]">{milestone.title}</span>
                        <span className="text-sm text-[hsl(var(--muted))]">{milestone.timing}</span>
                      </span>
                    </div>
                  </Reveal>
                );
                })}
              </ol>
            </div>

            <p className="mt-8 text-xs text-[hsl(var(--muted))]">{PAYMENT_PLAN_NOTE}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

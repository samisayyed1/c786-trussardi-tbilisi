import { JOURNEY_STEPS } from '../content/site';
import { MEDIA } from '../content/media-manifest';
import { Picture } from './ui/Picture';
import { Reveal } from './ui/Reveal';
import { Eyebrow, Section, SectionHeading } from './ui/Section';

/**
 * The C786 investor journey.
 *
 * Deliberately contains no client counts, transaction values, certificates or
 * testimonials — none have been supplied, so none are shown.
 */
export function WhyC786() {
  return (
    <Section surface aria-labelledby="why-heading">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>Why C786 Realty</Eyebrow>
              <SectionHeading id="why-heading" className="mt-6">
                Your Investment Partner Before, During and <span className="font-display">After the Purchase</span>
              </SectionHeading>
              <p className="mt-6 text-[hsl(var(--muted))]">From your first consultation until years after your purchase.</p>
            </Reveal>

            <Reveal delay={0.12}>
              <Picture
                asset={MEDIA['exterior-facade']}
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="mt-10 aspect-[4/3] w-full rounded-lg"
                imgClassName="object-cover"
              />
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:pt-4">
            <ol className="border-t border-[hsl(var(--stroke))]">
              {JOURNEY_STEPS.map((step, position) => (
                <Reveal as="li" key={step.title} delay={position * 0.05}>
                  <div className="flex gap-5 border-b border-[hsl(var(--stroke))] py-6 md:gap-8">
                    <span className="shrink-0 font-mono text-xs text-[hsl(var(--accent-start))] tabular-nums">
                      {String(position + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-lg text-[hsl(var(--text))] md:text-xl">{step.title}</h3>
                      <p className="mt-1.5 text-sm text-[hsl(var(--muted))]">{step.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Section>
  );
}

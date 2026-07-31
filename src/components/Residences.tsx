import { useState } from 'react';
import { Expand, Plus } from 'lucide-react';
import { AREA_QUALIFIER, RESIDENCES, type Residence } from '../content/site';
import { MEDIA, type MediaAsset, type MediaId } from '../content/media-manifest';
import { Picture } from './ui/Picture';
import { Reveal } from './ui/Reveal';
import { Eyebrow, Section, SectionHeading } from './ui/Section';
import { Lightbox } from './ui/Lightbox';
import { useLightbox } from '../hooks/useLightbox';
import { track } from '../lib/analytics';

const asset = (id: string): MediaAsset => MEDIA[id as MediaId];

interface ResidenceCardProps {
  residence: Residence;
  /** The first card spans both columns on desktop, anchoring the bento. */
  featured: boolean;
  onViewPlan: () => void;
}

function ResidenceCard({ residence, featured, onViewPlan }: ResidenceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const image = asset(residence.imageId);
  const detailsId = `residence-details-${residence.id}`;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-[hsl(var(--stroke))] bg-[hsl(var(--surface))] transition-colors duration-500 hover:border-[hsl(var(--accent-start))]/40 ${
        featured ? 'lg:col-span-2 lg:flex-row' : ''
      }`}
    >
      <Picture
        asset={image}
        /* Both card types render at roughly half the shell width on desktop —
           the non-featured value used to say 30vw, which under-declared the box
           by 40% and made the browser fetch a visibly soft crop. */
        sizes={featured ? '(min-width: 1024px) 46vw, 100vw' : '(min-width: 1024px) 45vw, 100vw'}
        className={`w-full shrink-0 ${featured ? 'aspect-[4/3] lg:aspect-auto lg:w-1/2' : 'aspect-[4/3]'}`}
        imgClassName="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
      />

      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-2xl md:text-[1.75rem]">{residence.name}</h3>
          <span className="shrink-0 text-xs tracking-[0.14em] text-[hsl(var(--muted))] uppercase">
            from {residence.areaFrom}
          </span>
        </div>

        <p className="mt-1.5 text-lg text-[hsl(var(--accent-start))]">from {residence.priceFrom}</p>

        <p className="mt-4 text-sm text-[hsl(var(--muted))]">{residence.summary}</p>

        <p className="mt-4 text-xs text-[hsl(var(--muted))]">
          <span className="text-[hsl(var(--text))]">Suited to</span> · {residence.suitedTo}
        </p>

        {/* Progressive disclosure keeps the bento calm but the detail reachable. */}
        <div
          id={detailsId}
          hidden={!expanded}
          className="mt-5 border-t border-[hsl(var(--stroke))] pt-4"
        >
          <ul className="space-y-2">
            {residence.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-[hsl(var(--muted))]">
                <span aria-hidden="true" className="accent-gradient mt-2 size-1 shrink-0 rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onViewPlan}
            className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-[hsl(var(--text))] underline decoration-[hsl(var(--stroke))] underline-offset-4 transition-colors hover:decoration-[hsl(var(--accent-start))]"
          >
            <Expand aria-hidden="true" className="size-4" />
            View floor plan
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[hsl(var(--stroke))] px-5 text-[0.8125rem] text-[hsl(var(--text))] transition-colors hover:border-[hsl(var(--accent-start))]"
          >
            <Plus
              aria-hidden="true"
              className={`size-3.5 transition-transform duration-300 ${expanded ? 'rotate-45' : ''}`}
            />
            {expanded ? 'Hide details' : 'View details'}
          </button>

          <a
            href="#enquire"
            onClick={() => track('residence_availability_click', { residence: residence.id })}
            className="inline-flex min-h-11 items-center rounded-full bg-[hsl(var(--text))] px-5 text-[0.8125rem] font-medium text-[hsl(var(--bg))] transition-colors hover:bg-white"
          >
            Check availability
          </a>
        </div>
      </div>
    </article>
  );
}

/** Bento layout of the three published residence types. */
export function Residences() {
  const lightbox = useLightbox();
  const plans = RESIDENCES.map((residence) => asset(residence.planId));

  return (
    <Section id="residences" surface aria-labelledby="residences-heading">
      <div className="shell">
        <Reveal>
          <Eyebrow>The residences</Eyebrow>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading id="residences-heading" className="max-w-2xl">
              Three Ways to <span className="font-display">Own Here</span>
            </SectionHeading>
            <p className="max-w-sm text-sm text-[hsl(var(--muted))]">
              Every residence is delivered fully furnished by Trussardi Casa. Floor plans below are the developer’s
              published layouts.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {RESIDENCES.map((residence, position) => (
            <Reveal key={residence.id} delay={position * 0.08} className={position === 0 ? 'lg:col-span-2' : ''}>
              <ResidenceCard
                residence={residence}
                featured={position === 0}
                onViewPlan={() => {
                  track('gallery_open', { context: 'floor-plan', residence: residence.id });
                  lightbox.open(position);
                }}
              />
            </Reveal>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-xs text-[hsl(var(--muted))]">{AREA_QUALIFIER}</p>
      </div>

      <Lightbox items={plans} index={lightbox.index} onClose={lightbox.close} onIndexChange={lightbox.setIndex} />
    </Section>
  );
}

import { Check } from 'lucide-react';
import { OVERVIEW_POINTS, PROJECT } from '../content/site';
import { MEDIA } from '../content/media-manifest';
import { Picture } from './ui/Picture';
import { Reveal } from './ui/Reveal';
import { Eyebrow, Section, SectionHeading } from './ui/Section';

/**
 * Asymmetric editorial overview: a tall image column set against copy and a
 * short spec list, rather than a symmetrical two-up.
 */
export function Overview() {
  return (
    <Section id="overview" aria-labelledby="overview-heading">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 lg:pt-8">
            <Reveal>
              <Eyebrow>
                {PROJECT.community}, {PROJECT.city}
              </Eyebrow>
              <SectionHeading id="overview-heading" className="mt-6">
                A New Landmark Between <span className="font-display">City and Nature</span>
              </SectionHeading>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-7 max-w-md text-[hsl(var(--muted))]">
                Set in the elevated Tbilisi Hills, {PROJECT.name} introduces contemporary Milanese living to Georgia’s
                first branded master-planned community—approximately ten minutes from central Tbilisi.
              </p>
            </Reveal>

            <Reveal delay={0.16}>
              <ul className="mt-10 space-y-0 border-t border-[hsl(var(--stroke))]">
                {OVERVIEW_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 border-b border-[hsl(var(--stroke))] py-3.5 text-sm text-[hsl(var(--text))]"
                  >
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[hsl(var(--accent-start))]" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.08}>
              <figure className="space-y-4">
                <Picture
                  asset={MEDIA['overview-aerial']}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="aspect-[4/3] w-full lg:aspect-[3/2]"
                  imgClassName="object-cover"
                />
                <figcaption className="text-xs text-[hsl(var(--muted))]">
                  {MEDIA['overview-aerial'].caption}
                </figcaption>
              </figure>
            </Reveal>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Reveal delay={0.14}>
                <Picture
                  asset={MEDIA['interior-kitchen']}
                  sizes="(min-width: 1024px) 27vw, 50vw"
                  className="aspect-[4/3] w-full"
                  imgClassName="object-cover"
                />
              </Reveal>
              <Reveal delay={0.2}>
                <Picture
                  asset={MEDIA['exterior-entrance']}
                  sizes="(min-width: 1024px) 27vw, 50vw"
                  className="aspect-[4/3] w-full"
                  imgClassName="object-cover"
                />
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

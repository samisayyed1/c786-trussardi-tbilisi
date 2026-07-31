import {
  Baby,
  Bell,
  Briefcase,
  BookOpen,
  Car,
  ChefHat,
  Cpu,
  Flag,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { AMENITIES_NOTE, AMENITY_GROUPS } from '../content/site';
import { MEDIA, type MediaAsset, type MediaId } from '../content/media-manifest';
import { Picture } from './ui/Picture';
import { Reveal } from './ui/Reveal';
import { Eyebrow, Section, SectionHeading } from './ui/Section';

/** Maps each published amenity to an icon. Keys must match `site.ts` exactly. */
const ICONS: Record<string, LucideIcon> = {
  '18-hole golf course': Flag,
  'Wellness centre': Heart,
  'Cafés and restaurants': UtensilsCrossed,
  'Luxury retail': ShoppingBag,
  'Office spaces': Briefcase,
  'European school': BookOpen,
  'AI University': Cpu,
  Kindergarten: Baby,
  'Five-star hotel services': Sparkles,
  Concierge: Bell,
  'Valet parking': Car,
  '24/7 security': ShieldCheck,
  'In-room dining': ChefHat,
  'On-call maintenance': Wrench,
};

const asset = (id: string): MediaAsset => MEDIA[id as MediaId];

/**
 * Amenities laid out as alternating editorial bands rather than a uniform card
 * grid: image and content swap sides on desktop and stack cleanly on mobile.
 */
export function Amenities() {
  return (
    <Section id="amenities" aria-labelledby="amenities-heading">
      <div className="shell">
        <Reveal>
          <Eyebrow>Community amenities</Eyebrow>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading id="amenities-heading" className="max-w-2xl">
              A Community, <span className="font-display">Not Just a Building</span>
            </SectionHeading>
            <p className="max-w-sm text-sm text-[hsl(var(--muted))]">
              Golf, wellness, retail, schooling and workplaces are planned into the Mira Verde masterplan around the
              residences.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 space-y-16 md:space-y-24">
          {AMENITY_GROUPS.map((group, position) => {
            const image = group.imageId ? asset(group.imageId) : null;
            const reversed = position % 2 === 1;

            return (
              <Reveal key={group.title}>
                <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
                  {image ? (
                    <figure className={`lg:col-span-7 ${reversed ? 'lg:order-2' : ''}`}>
                      <Picture
                        asset={image}
                        sizes="(min-width: 1024px) 55vw, 100vw"
                        className="aspect-[16/10] w-full rounded-lg"
                        imgClassName="object-cover"
                      />
                    </figure>
                  ) : null}

                  <div className={`lg:col-span-5 ${reversed ? 'lg:order-1' : ''}`}>
                    <h3 className="text-[clamp(1.5rem,3.5vw,2.25rem)]">{group.title}</h3>
                    {group.blurb ? <p className="mt-3 text-sm text-[hsl(var(--muted))]">{group.blurb}</p> : null}

                    <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {group.items.map((item) => {
                        const Icon = ICONS[item] ?? Sparkles;
                        return (
                          <li key={item} className="flex items-center gap-3 text-sm text-[hsl(var(--text))]">
                            <Icon aria-hidden="true" className="size-4 shrink-0 text-[hsl(var(--accent-start))]" />
                            {item}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-14 text-xs text-[hsl(var(--muted))]">{AMENITIES_NOTE}</p>
      </div>
    </Section>
  );
}

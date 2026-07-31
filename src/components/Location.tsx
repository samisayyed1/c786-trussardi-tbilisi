import { useState } from 'react';
import { MapPin, Play } from 'lucide-react';
import { LOCATION_COPY, MAP, TRAVEL_TIMES, TRAVEL_TIMES_NOTE } from '../content/site';
import { MEDIA } from '../content/media-manifest';
import { Picture } from './ui/Picture';
import { Reveal } from './ui/Reveal';
import { Eyebrow, Section, SectionHeading } from './ui/Section';

/** OpenStreetMap embed — no API key, and only requested after an explicit click. */
function mapEmbedUrl(): string {
  const spread = 0.06;
  const bbox = [
    MAP.longitude - spread,
    MAP.latitude - spread / 2,
    MAP.longitude + spread,
    MAP.latitude + spread / 2,
  ].join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${MAP.latitude}%2C${MAP.longitude}`;
}

/**
 * Location section.
 *
 * The map is not loaded on page load. A poster image stands in until the visitor
 * asks for it, so no third-party request is made without an interaction.
 */
export function Location() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <Section id="location" aria-labelledby="location-heading">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>Location</Eyebrow>
              <SectionHeading id="location-heading" className="mt-6">
                Connected to Tbilisi, <span className="font-display">Surrounded by Nature</span>
              </SectionHeading>
              <p className="mt-6 text-[hsl(var(--muted))]">{LOCATION_COPY}</p>
            </Reveal>

            <Reveal delay={0.12}>
              <ul className="mt-10 border-t border-[hsl(var(--stroke))]">
                {TRAVEL_TIMES.map((entry) => (
                  <li
                    key={entry.destination}
                    className="flex items-baseline justify-between gap-4 border-b border-[hsl(var(--stroke))] py-4"
                  >
                    <span className="text-sm text-[hsl(var(--text))]">{entry.destination}</span>
                    <span className="shrink-0 text-lg text-[hsl(var(--accent-start))] tabular-nums">
                      {entry.minutes} min
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-[hsl(var(--muted))]">{TRAVEL_TIMES_NOTE}</p>
            </Reveal>
          </div>

          <div className="space-y-4 lg:col-span-7">
            <Reveal delay={0.08}>
              <figure>
                <Picture
                  asset={MEDIA['location-aerial']}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="aspect-[16/9] w-full rounded-lg"
                  imgClassName="object-cover"
                />
                <figcaption className="mt-3 text-xs text-[hsl(var(--muted))]">
                  {MEDIA['location-aerial'].caption}
                </figcaption>
              </figure>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-[hsl(var(--stroke))]">
                {mapLoaded ? (
                  <iframe
                    title={`Map showing ${MAP.label}`}
                    src={mapEmbedUrl()}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="size-full border-0"
                  />
                ) : (
                  <>
                    <Picture
                      asset={MEDIA['location-masterplan']}
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="absolute inset-0 size-full"
                      imgClassName="object-cover opacity-45"
                    />
                    <div className="absolute inset-0 grid place-items-center bg-black/45 p-6 text-center">
                      <div>
                        <MapPin aria-hidden="true" className="mx-auto size-6 text-[hsl(var(--accent-start))]" />
                        <p className="mt-3 text-sm text-[hsl(var(--text))]">{MAP.label}</p>
                        <button
                          type="button"
                          onClick={() => setMapLoaded(true)}
                          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[hsl(var(--stroke))] bg-[hsl(var(--bg))]/70 px-5 text-sm text-[hsl(var(--text))] backdrop-blur-sm transition-colors hover:border-[hsl(var(--accent-start))]"
                        >
                          <Play aria-hidden="true" className="size-3.5" />
                          Load interactive map
                        </button>
                        <p className="mt-3 text-[0.6875rem] text-[hsl(var(--muted))]">
                          Loads OpenStreetMap only when you choose to.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}

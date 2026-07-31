import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Expand } from 'lucide-react';
import { GALLERY_MEDIA, type MediaAsset, type MediaKind } from '../content/media-manifest';
import { Picture } from './ui/Picture';
import { Reveal } from './ui/Reveal';
import { Eyebrow, Section, SectionHeading } from './ui/Section';
import { Lightbox } from './ui/Lightbox';
import { useLightbox } from '../hooks/useLightbox';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { track } from '../lib/analytics';

gsap.registerPlugin(ScrollTrigger);

const KIND_LABEL: Record<MediaKind, string> = {
  exterior: 'Exterior render',
  interior: 'Interior render',
  amenity: 'Amenity render',
  location: 'Location photograph',
  plan: 'Floor plan',
  masterplan: 'Masterplan',
};

/** Small, fixed tilts. Applied on desktop only, and never enough to feel gimmicky. */
const TILTS = [-1.2, 0.9, -0.6, 1.1, -0.9, 0.7];

/**
 * Cinematic project gallery.
 *
 * Desktop: two columns drifting at different rates under a scrubbed parallax.
 * Mobile and reduced-motion: a plain single-column stack with no transforms and
 * no oversized scroll container.
 */
export function Gallery() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const lightbox = useLightbox();

  useEffect(() => {
    if (reducedMotion || !isDesktop) return;

    const context = gsap.context(() => {
      // Opposing drift between the columns creates the parallax without
      // pinning the section or inflating its height.
      gsap.to('[data-gallery-column="left"]', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
      gsap.to('[data-gallery-column="right"]', {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    }, rootRef);

    return () => context.revert();
  }, [reducedMotion, isDesktop]);

  // Distribute by running column height rather than alternating index. Simple
  // odd/even splitting leaves one column far longer than the other as soon as a
  // portrait image is in the set, which reads as a block of empty space beside
  // the taller column.
  const columns = useMemo(() => {
    if (!isDesktop) return [GALLERY_MEDIA];

    const buckets: MediaAsset[][] = [[], []];
    const heights = [0, 0];

    for (const item of GALLERY_MEDIA) {
      const target = heights[0] <= heights[1] ? 0 : 1;
      buckets[target].push(item);
      // Normalised to a unit column width, so only the aspect ratio matters.
      heights[target] += item.height / item.width;
    }

    return buckets;
  }, [isDesktop]);

  return (
    <Section surface aria-labelledby="gallery-heading">
      <div className="shell">
        <Reveal>
          <Eyebrow>Project gallery</Eyebrow>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading id="gallery-heading" className="max-w-2xl">
              Inside <span className="font-display">Mira Verde</span>
            </SectionHeading>
            <p className="max-w-sm text-sm text-[hsl(var(--muted))]">
              Developer renders and location photography. Renders are indicative and do not form part of any contract.
            </p>
          </div>
        </Reveal>

        <div ref={rootRef} className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-6">
          {columns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              data-gallery-column={columnIndex === 0 ? 'left' : 'right'}
              className={`flex min-w-0 flex-col gap-4 lg:gap-6 ${columnIndex === 1 ? "lg:pt-16" : ""}`}
            >
              {column.map((item) => {
                const galleryIndex = GALLERY_MEDIA.indexOf(item);
                const tilt = isDesktop ? TILTS[galleryIndex % TILTS.length] : 0;

                return (
                  <Reveal key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        track('gallery_open', { asset: item.id, kind: item.kind });
                        lightbox.open(galleryIndex);
                      }}
                      style={{ rotate: `${tilt}deg` }}
                      className="group block w-full cursor-zoom-in text-left transition-transform duration-500 ease-out hover:!rotate-0"
                    >
                      <div className="relative overflow-hidden rounded-lg">
                        <Picture
                          asset={item}
                          sizes="(min-width: 1024px) 45vw, 100vw"
                          className="w-full"
                          style={{ aspectRatio: `${item.width} / ${item.height}` }}
                          imgClassName="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                        />
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100"
                        >
                          <span className="grid size-11 place-items-center rounded-full border border-white/40 backdrop-blur-sm">
                            <Expand className="size-4" />
                          </span>
                        </span>
                      </div>
                      {/* min-w-0 lets the truncating caption shrink instead of
                          forcing the grid track to its min-content width. */}
                      <span className="mt-3 flex min-w-0 items-baseline gap-3 text-xs text-[hsl(var(--muted))]">
                        <span className="shrink-0 tracking-[0.14em] text-[hsl(var(--accent-start))] uppercase">
                          {KIND_LABEL[item.kind]}
                        </span>
                        <span className="min-w-0 truncate">{item.caption}</span>
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        items={GALLERY_MEDIA}
        index={lightbox.index}
        onClose={lightbox.close}
        onIndexChange={lightbox.setIndex}
      />
    </Section>
  );
}

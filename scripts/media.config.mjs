/**
 * Curated media map for Trussardi Residences, Mira Verde (Tbilisi, Georgia).
 *
 * Every entry below points at a genuine asset published by the developer on the
 * official project sites (trussardi-residences.ge / mira-verde.com). Nothing here
 * is stock photography, AI-generated architecture, or media from another project.
 *
 * `source` records provenance so C786 can audit or replace any asset.
 * `kind` drives the caption badge shown in the gallery lightbox.
 *
 * To swap in a client-supplied file: drop it into `media-src/`, change `file`,
 * then run `pnpm media`.
 */

/** @typedef {'exterior'|'interior'|'amenity'|'location'|'plan'|'masterplan'} MediaKind */

const OFFICIAL_TRUSSARDI = 'https://trussardi-residences.ge/';
const OFFICIAL_MIRA_VERDE = 'https://mira-verde.com/';

/**
 * @type {Array<{
 *   id: string, file: string, kind: MediaKind, alt: string,
 *   caption: string, source: string, priority?: boolean, gallery?: boolean
 * }>}
 */
export const MEDIA = [
  {
    id: 'hero',
    file: 'mv_Mira_Verde_019-.webp',
    kind: 'exterior',
    alt: 'Dusk render of the Trussardi Residences building at Mira Verde, its illuminated terraces set against the wooded Tbilisi Hills.',
    caption: 'Trussardi Residences — exterior render at dusk',
    source: OFFICIAL_MIRA_VERDE,
    priority: true,
    /**
     * Art direction, not just a smaller crop.
     *
     * The landscape render is composed for a wide frame. Dropped into a phone
     * viewport — roughly 1:2 — object-cover fills vertically with no crop, so
     * the top half is empty sky and the architecture disappears behind the
     * text. This portrait render of the same community fills the frame instead.
     */
    mobileFile: 'mv2_68.webp',
    mobileAlt:
      'Dusk render of the illuminated Mira Verde residences stepping down the wooded hillside.',
  },
  {
    id: 'overview-aerial',
    file: 'Mira_Verde_017.webp',
    kind: 'exterior',
    alt: 'Aerial render of the Mira Verde masterplan terracing down a forested hillside with the city of Tbilisi spread out beyond.',
    caption: 'Mira Verde masterplan above Tbilisi — aerial render',
    source: OFFICIAL_TRUSSARDI,
    gallery: true,
  },
  {
    id: 'interior-living',
    file: 'mv2_8648.webp',
    kind: 'interior',
    alt: 'Trussardi Casa furnished living room with curved cream sofa, tan armchair and floor-to-ceiling glazing framing the hillside.',
    caption: 'Living area, furnished by Trussardi Casa — interior render',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'interior-bedroom',
    file: 'mv2_3535.webp',
    kind: 'interior',
    alt: 'Bedroom with a low platform bed and wraparound glazing looking over the Tbilisi valley at daybreak.',
    caption: 'Bedroom with panoramic outlook — interior render',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'interior-lounge',
    file: 'mv2_08868.webp',
    kind: 'interior',
    alt: 'Open-plan lounge with sculptural seating and full-height windows overlooking the golf course greens.',
    caption: 'Lounge overlooking the golf course — interior render',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'interior-kitchen',
    file: 'mv2_03235.webp',
    kind: 'interior',
    alt: 'Furnished open-plan kitchen and dining space with integrated appliances and a terrace beyond the glazing.',
    caption: 'Kitchen and dining, integrated appliances — interior render',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'amenity-golf',
    file: 'mv_9930a3487bf544a999b230b3e5a84d38a3491956.webp',
    kind: 'amenity',
    alt: 'Golf green beside water at low sun, with a player putting and a buggy on the fairway.',
    caption: '18-hole golf course — amenity render',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'amenity-retail',
    file: 'Mira_Verde_020.webp',
    kind: 'amenity',
    alt: 'Terraced retail and dining promenade at sunset with people walking between glazed storefronts.',
    caption: 'Retail and dining promenade — amenity render',
    source: OFFICIAL_TRUSSARDI,
    gallery: true,
  },
  {
    id: 'amenity-wellness',
    file: 'mv_6568.webp',
    kind: 'amenity',
    alt: 'Wellness pavilion beside a reflecting pool catching the last of the sunset.',
    caption: 'Wellness pavilion — amenity render',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'amenity-offices',
    file: 'mv_office.webp',
    kind: 'amenity',
    alt: 'Multi-level workplace and community building with planted terraces under a pink evening sky.',
    caption: 'Workplaces and community building — amenity render',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'amenity-clubhouse',
    file: 'Mira_Verde_21.webp',
    kind: 'amenity',
    alt: 'Single-storey clubhouse pavilion with deep timber eaves and open colonnade under bright cloud.',
    caption: 'Clubhouse pavilion — amenity render',
    source: OFFICIAL_TRUSSARDI,
    gallery: true,
  },
  {
    id: 'exterior-evening',
    file: 'Mira_Verde_46.webp',
    kind: 'exterior',
    alt: 'Residences glowing at blue hour, stepping down the hillside among mature trees.',
    caption: 'Residences at blue hour — exterior render',
    source: OFFICIAL_TRUSSARDI,
    priority: false,
    gallery: true,
  },
  {
    id: 'exterior-walkway',
    file: 'Mira_Verde_50.webp',
    kind: 'exterior',
    alt: 'Lantern-lit pedestrian walkway running between residential blocks at night.',
    caption: 'Residential walkway at night — exterior render',
    source: OFFICIAL_TRUSSARDI,
    gallery: true,
  },
  {
    id: 'exterior-entrance',
    file: 'mv_Mira_Verde_23.webp',
    kind: 'exterior',
    alt: 'Arrival colonnade with slatted timber soffits and planting, lit warmly at sunset.',
    caption: 'Arrival colonnade — exterior render',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'exterior-facade',
    file: 'mv_gallery7.webp',
    kind: 'exterior',
    alt: 'Long residential facade with vertical timber fins rising from a landscaped rock garden.',
    caption: 'Timber-finned facade — exterior render',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'exterior-sunset',
    file: 'mv2_Mira_Verde_38.webp',
    kind: 'exterior',
    alt: 'Stepped residences catching an orange sunset across the wooded ridge.',
    caption: 'Stepped residences at sunset — exterior render',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'location-aerial',
    file: 'mv2_Mira_Verde_001-.webp',
    kind: 'location',
    alt: 'Wide dusk view across the Tbilisi valley with the Mira Verde community in the foreground and the city lights beyond.',
    caption: 'Mira Verde above the Tbilisi valley — location render',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'location-masterplan',
    file: 'mv2_33x.webp',
    kind: 'masterplan',
    alt: 'Annotated aerial masterplan diagram showing the Trussardi residential towers, branded apartments, townhouses, five-star hotel and school across the Mira Verde site.',
    caption: 'Mira Verde masterplan — annotated site diagram',
    source: OFFICIAL_MIRA_VERDE,
    gallery: true,
  },
  {
    id: 'location-tbilisi-street',
    file: 'daaa4a67b8a7246023a6b7cd10524bbcfa75c29f.webp',
    kind: 'location',
    alt: 'Tree-lined Tbilisi street with a Georgian flag on a classical stone facade.',
    caption: 'Central Tbilisi — location photograph',
    source: OFFICIAL_TRUSSARDI,
    gallery: true,
  },
  {
    id: 'location-tbilisi-city',
    file: '3f1d3ab98f50e46ac91fa83cbf9b641e63128061.webp',
    kind: 'location',
    alt: 'Traffic moving along a tree-lined Tbilisi boulevard past a contemporary canopied building.',
    caption: 'Tbilisi boulevard — location photograph',
    source: OFFICIAL_TRUSSARDI,
    gallery: true,
  },
  {
    id: 'plan-studio',
    file: 'st1.jpg',
    kind: 'plan',
    alt: 'Studio floor plan showing a single bedroom-living space, bathroom, kitchen run and balcony.',
    caption: 'Studio — indicative floor plan',
    source: OFFICIAL_TRUSSARDI,
  },
  {
    id: 'plan-1br',
    file: '1br.jpg',
    kind: 'plan',
    alt: 'One-bedroom floor plan showing a separate bedroom, living room, bathroom, laundry and balcony.',
    caption: 'One-bedroom — indicative floor plan',
    source: OFFICIAL_TRUSSARDI,
  },
  {
    id: 'plan-2br',
    file: '2br1.jpg',
    kind: 'plan',
    alt: 'Two-bedroom floor plan showing two bedrooms, two bathrooms, living room, laundry and balcony area.',
    caption: 'Two-bedroom — indicative floor plan',
    source: OFFICIAL_TRUSSARDI,
  },
  {
    id: 'closing',
    file: 'Mira_Verde_010.webp',
    kind: 'exterior',
    alt: 'The Mira Verde community lit against a deep blue night sky on the forested hillside.',
    caption: 'Mira Verde at night — exterior render',
    source: OFFICIAL_TRUSSARDI,
  },
];

/**
 * Rendered widths. Mobile-first: the smallest crop is what phones actually
 * download. The upper tiers exist for retina desktops, where a full-bleed
 * element at 1440 CSS px needs close to 2900 device pixels.
 *
 * The optimizer also always emits the source's native width, so no available
 * detail is left on the table.
 *
 * Note the hard ceiling: the developer publishes these renders at 1920–2400px.
 * There is no 4K or 8K original to fetch, and upscaling would invent detail
 * rather than recover it.
 */
export const WIDTHS = [420, 640, 960, 1280, 1600, 1920, 2400];

/** Floor plans are documents, not photography — keep them crisp but capped. */
export const PLAN_WIDTHS = [640, 1024, 1600];

/**
 * Encoder quality, scaled by tier.
 *
 * These are architectural renders with large smooth gradients — sky, glass,
 * concrete — which is exactly where aggressive AVIF quantisation shows up as
 * banding and mush. The big tiers therefore get real quality.
 *
 * The small tiers deliberately do not. A 640px crop is only ever painted into a
 * few hundred CSS pixels on a phone, where the extra bytes buy no visible
 * sharpness but do cost load time on a mobile connection. Spending the budget
 * where it is actually resolvable is the whole point.
 */
const SMALL_TIER_MAX = 960;

export function qualityFor(width, kind) {
  const isPlan = kind === 'plan';
  if (isPlan) return { avif: 76, webp: 90 };
  return width <= SMALL_TIER_MAX ? { avif: 55, webp: 76 } : { avif: 70, webp: 86 };
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * C786 REALTY — SINGLE SOURCE OF TRUTH
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every editable fact on this landing page lives in this file: pricing, payment
 * plan, handover, contact details, form endpoint, legal disclaimers and copy.
 * Components read from here and never hard-code a figure, so C786 can update the
 * campaign without touching a single component.
 *
 * PROVENANCE
 *   All project figures below were verified on 30 July 2026 against the official
 *   developer sources:
 *     • https://miradevelopments.ae/projects/trussardi-residences-tbilisi-georgia
 *     • https://trussardi-residences.ge/
 *   No third-party property portal was used as a factual source.
 *
 * ⚠ ITEMS AWAITING CLIENT INPUT are marked `NEEDS_CLIENT_INPUT`. They render as
 *   disabled/hidden rather than as fake data — see `isPlaceholder()` below.
 */

/** Marker for values C786 must supply before launch. Never shipped as real data. */
export const NEEDS_CLIENT_INPUT = '__NEEDS_CLIENT_INPUT__' as const;

/** True when a config value is still an unfilled placeholder. */
export const isPlaceholder = (value: string): boolean => value === NEEDS_CLIENT_INPUT;

/* ───────────────────────────── Types ───────────────────────────── */

export interface ContactConfig {
  /** E.164 number used for tel: links. */
  readonly phone: string;
  /** Digits only, no '+', used to build wa.me links. */
  readonly whatsappNumber: string;
  readonly email: string;
  /** Prefilled first message for WhatsApp handoffs. */
  readonly whatsappMessage: string;
}

export interface KeyFact {
  readonly label: string;
  readonly value: string;
  /** Optional qualifier rendered as small print beneath the value. */
  readonly note?: string;
}

export interface Residence {
  readonly id: 'studio' | 'one-bedroom' | 'two-bedroom';
  readonly name: string;
  readonly areaFrom: string;
  readonly priceFrom: string;
  readonly summary: string;
  readonly suitedTo: string;
  readonly features: readonly string[];
  /** Media manifest ids. */
  readonly imageId: string;
  readonly planId: string;
}

export interface InvestmentHighlight {
  readonly value: string;
  readonly label: string;
  readonly detail: string;
  /** Rendered as a visible qualifier. Required wherever a claim is conditional. */
  readonly qualifier?: string;
  /** Drives the count-up animation when the value is genuinely numeric. */
  readonly countTo?: number;
  readonly countSuffix?: string;
}

export interface PaymentMilestone {
  readonly percent: number;
  readonly title: string;
  readonly timing: string;
}

export interface AmenityGroup {
  readonly title: string;
  readonly items: readonly string[];
  readonly imageId?: string;
  readonly blurb?: string;
}

export interface TravelTime {
  readonly minutes: number;
  readonly destination: string;
}

export interface JourneyStep {
  readonly title: string;
  readonly description: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface FormOption {
  readonly value: string;
  readonly label: string;
}

/* ───────────────────────────── Brand & contact ───────────────────────────── */

export const BRAND = {
  name: 'C786 Realty',
  wordmark: 'C786',
  wordmarkSuffix: 'REALTY',
  tagline: 'Georgia property investment',
  /**
   * ⚠ Set to your production domain before launch — drives canonical + OG URLs.
   * Configurable at build time via VITE_SITE_URL.
   */
  siteUrl: import.meta.env.VITE_SITE_URL ?? 'https://example.invalid',
} as const;

/**
 * ⚠ NEEDS_CLIENT_INPUT — C786's own verified contact details.
 * Mira Developments' contact details must NOT be reused here.
 * Until these are filled, contact CTAs render disabled with an honest label.
 */
export const CONTACT: ContactConfig = {
  phone: NEEDS_CLIENT_INPUT,
  whatsappNumber: NEEDS_CLIENT_INPUT,
  email: NEEDS_CLIENT_INPUT,
  whatsappMessage:
    "Hello C786 Realty, I'd like current prices and availability for Trussardi Residences, Mira Verde in Tbilisi.",
};

/** Builds a wa.me deep link, or null when the number is not yet configured. */
export function whatsappLink(message: string = CONTACT.whatsappMessage): string | null {
  if (isPlaceholder(CONTACT.whatsappNumber)) return null;
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/* ───────────────────────────── Project facts ───────────────────────────── */

export const PROJECT = {
  name: 'Trussardi Residences',
  community: 'Mira Verde',
  city: 'Tbilisi',
  country: 'Georgia',
  developer: 'MIRA Developments L.L.C',
  interiorBrand: 'Trussardi Casa',
  handover: 'Q3 2029',
  paymentPlanLabel: '60/40',
  areaFrom: '38 m²',
  startingPrice: 'AED 721,095',
  startingPriceLabel: 'Studios from',
  eoi: 'USD 10,000',
  eoiNote: 'Refundable expression-of-interest deposit, subject to developer terms.',
  /** Shown under the hero facts strip. */
  verifiedOn: '30 July 2026',
} as const;

export const HERO_FACTS: readonly KeyFact[] = [
  { label: 'Starting from', value: PROJECT.startingPrice, note: 'Studios' },
  { label: 'Residences', value: 'Studio, 1 & 2 bed' },
  { label: 'Areas from', value: PROJECT.areaFrom },
  { label: 'Payment plan', value: PROJECT.paymentPlanLabel },
  { label: 'Handover', value: PROJECT.handover },
];

export const TRUST_POINTS: readonly string[] = [
  'Dubai-based developer',
  'Fully furnished branded residences',
  'International buyer support',
  'Documentation assistance',
  'Property and rental management',
];

export const OVERVIEW_POINTS: readonly string[] = [
  'Fully furnished residences, delivered move-in ready',
  'Interiors by Trussardi Casa',
  'Integrated white goods throughout',
  'Premium kitchen appliances',
  'Complete kitchenware included',
  'Elevated views and landscaped surroundings',
  'Integrated hospitality, education, wellness, retail and workplaces',
];

export const RESIDENCES: readonly Residence[] = [
  {
    id: 'studio',
    name: 'Studio',
    areaFrom: '38 m²',
    priceFrom: 'AED 721,095',
    summary:
      'The entry point into the community — a single, efficiently planned volume delivered fully furnished with a balcony.',
    suitedTo: 'Entry-level international investors',
    features: ['Fully furnished by Trussardi Casa', 'Integrated appliances', 'Balcony', 'Move-in ready at handover'],
    imageId: 'interior-bedroom',
    planId: 'plan-studio',
  },
  {
    id: 'one-bedroom',
    name: 'One-bedroom',
    areaFrom: '74.9 m²',
    priceFrom: 'AED 1.2M',
    summary:
      'A separated bedroom and a generous living room, with a dedicated laundry and balcony running the width of the plan.',
    suitedTo: 'Couples, long-stay residents and rental positioning',
    features: ['Separate bedroom', 'Dedicated laundry', 'Full-width balcony', 'Fully furnished'],
    imageId: 'interior-living',
    planId: 'plan-1br',
  },
  {
    id: 'two-bedroom',
    name: 'Two-bedroom',
    areaFrom: '107.8 m²',
    priceFrom: 'AED 1.9M',
    summary:
      'Two bedrooms and two bathrooms arranged around an open living and dining space, with a wide balcony area.',
    suitedTo: 'Families and higher-budget investors',
    features: ['Two bedrooms, two bathrooms', 'Open-plan living and dining', 'Laundry room', 'Fully furnished'],
    imageId: 'interior-lounge',
    planId: 'plan-2br',
  },
];

/**
 * Areas for the 1- and 2-bedroom types are carried over from the brief and are
 * indicative. Confirm against the current client-approved price list before launch.
 */
export const AREA_QUALIFIER =
  'Areas are indicative and measured to the developer’s standard. Final areas are confirmed in the sale documentation.';

export const INVESTMENT_HIGHLIGHTS: readonly InvestmentHighlight[] = [
  {
    value: '8%',
    countTo: 8,
    countSuffix: '%',
    label: 'Rental guarantee, 10 years',
    detail: 'A guaranteed rental return of 8% for ten years, operated with professional management.',
    qualifier: 'Subject to eligibility and developer terms.',
  },
  {
    value: '60/40',
    label: 'Payment plan',
    detail: '60% across construction in six equal instalments, with the remaining 40% due on completion.',
  },
  {
    value: '5',
    countTo: 5,
    label: 'Year warranty',
    detail:
      'Covers key building systems and structural elements, as well as essential interior finishes.',
    qualifier: 'Per the developer’s published warranty terms.',
  },
  {
    value: '100%',
    countTo: 100,
    countSuffix: '%',
    label: 'Foreign ownership',
    detail: 'Georgia permits foreign nationals to own residential property outright.',
    qualifier: 'Subject to applicable Georgian law.',
  },
  {
    value: '5',
    countTo: 5,
    label: 'Year residency permit',
    detail: 'Property ownership in Georgia can support a residency permit of up to five years.',
    qualifier: 'Subject to eligibility, immigration rules and independent legal advice.',
  },
  {
    value: '10',
    countTo: 10,
    countSuffix: ' min',
    label: 'To central Tbilisi',
    detail: 'Approximately ten minutes from the centre of the city, and twenty from the airport.',
  },
];

export const PAYMENT_PLAN: readonly PaymentMilestone[] = [
  { percent: 10, title: 'On booking', timing: 'Reservation' },
  { percent: 10, title: 'Pre-sale agreement signing', timing: 'Within 30 days' },
  { percent: 10, title: 'On construction permit', timing: 'Approx. month 6' },
  { percent: 10, title: 'Instalment', timing: '12 months from booking' },
  { percent: 10, title: 'Instalment', timing: '21 months from booking' },
  { percent: 10, title: 'Instalment', timing: '36 months from booking' },
  { percent: 40, title: 'On completion', timing: PROJECT.handover },
];

export const PAYMENT_PLAN_NOTE =
  'Instalment structure as published by the developer. Payment plans are subject to change and to the terms of the sale documentation.';

export const AMENITY_GROUPS: readonly AmenityGroup[] = [
  {
    title: 'Sport & leisure',
    blurb: 'An 18-hole course anchors the community, with dining and wellness woven through the masterplan.',
    items: ['18-hole golf course', 'Wellness centre', 'Cafés and restaurants'],
    imageId: 'amenity-golf',
  },
  {
    title: 'Retail & workplace',
    blurb: 'Everyday needs and working life are planned into the community rather than bolted on.',
    items: ['Luxury retail', 'Office spaces'],
    imageId: 'amenity-retail',
  },
  {
    title: 'Education',
    blurb: 'Schooling from early years upward is part of the masterplan.',
    items: ['European school', 'AI University', 'Kindergarten'],
    imageId: 'amenity-offices',
  },
  {
    title: 'Hotel services',
    blurb: 'Residents draw on five-star hospitality operations on site.',
    items: [
      'Five-star hotel services',
      'Concierge',
      'Valet parking',
      '24/7 security',
      'In-room dining',
      'On-call maintenance',
    ],
    imageId: 'amenity-wellness',
  },
];

export const AMENITIES_NOTE =
  'Amenities are as published by the developer for the Mira Verde masterplan and are delivered in phases.';

export const TRAVEL_TIMES: readonly TravelTime[] = [
  { minutes: 10, destination: 'Tbilisi city centre' },
  { minutes: 14, destination: 'Old Town & Narikala Fortress' },
  { minutes: 20, destination: 'Tbilisi International Airport' },
  { minutes: 35, destination: 'Kumisi Lake' },
];

export const LOCATION_COPY =
  'Mira Verde occupies the elevated ground of the Tbilisi Hills, above the Krtsanisi district on the city’s southern edge. It is high enough for long views across the valley and the tree line, while central Tbilisi and the international airport both stay inside a short drive.';

export const TRAVEL_TIMES_NOTE = 'Approximate driving times published by the developer. Actual times vary with traffic.';

/** Map coordinates for the click-to-load map. Approximate site location. */
export const MAP = {
  latitude: 41.6438,
  longitude: 44.8271,
  zoom: 12,
  label: 'Mira Verde, Tbilisi Hills, Georgia',
} as const;

export const JOURNEY_STEPS: readonly JourneyStep[] = [
  {
    title: 'Investment consultation',
    description: 'We start with your budget, timeline and what you want the property to do for you.',
  },
  {
    title: 'Property and unit selection',
    description: 'We shortlist residence types and available units against those goals.',
  },
  {
    title: 'Purchase and documentation support',
    description: 'We guide you through reservation, the sale agreement and the paperwork around it.',
  },
  {
    title: 'Handover and property management',
    description: 'We coordinate handover and arrange ongoing management of the residence.',
  },
  {
    title: 'Rental management',
    description: 'We help position the property for rental and oversee it once it is let.',
  },
  {
    title: 'Resale and long-term assistance',
    description: 'When you decide to exit, we support the resale and the process around it.',
  },
];

/* ───────────────────────────── Lead form ───────────────────────────── */

export const FORM = {
  /**
   * ⚠ NEEDS_CLIENT_INPUT — set VITE_LEAD_ENDPOINT to your lead destination
   * (Google Form formResponse URL, Formspree, or your own serverless function).
   * Documented in .env.example. Never put credentials in this file: the endpoint
   * must be safe to expose, with any secret held server-side.
   *
   * With no endpoint configured, the form does NOT claim success — it hands the
   * completed answers to WhatsApp instead, so no lead is silently lost.
   */
  endpoint: import.meta.env.VITE_LEAD_ENDPOINT ?? '',
} as const;

export const PROPERTY_TYPE_OPTIONS: readonly FormOption[] = [
  { value: 'studio', label: 'Studio apartment' },
  { value: '1-bed', label: '1-bedroom apartment' },
  { value: '2-bed', label: '2-bedroom apartment' },
  { value: 'multiple', label: 'Multiple investment units' },
  { value: 'recommendation', label: 'I would like a recommendation' },
];

export const BUDGET_OPTIONS: readonly FormOption[] = [
  { value: 'below-500k', label: 'Below AED 500,000' },
  { value: '500-700k', label: 'AED 500,000–700,000' },
  { value: '700k-1m', label: 'AED 700,001–1,000,000' },
  { value: '1m-1.7m', label: 'AED 1,000,001–1,700,000' },
  { value: 'above-1.7m', label: 'More than AED 1,700,000' },
  { value: 'unsure', label: 'I am not sure yet' },
];

export const FUNDING_OPTIONS: readonly FormOption[] = [
  { value: 'available', label: 'My investment funds are available' },
  { value: 'after-selection', label: 'I can arrange funds after selecting a property' },
  { value: 'payment-plan', label: 'I require a developer payment plan' },
  { value: 'financing', label: 'I require financing assistance' },
  { value: 'evaluating', label: 'I am still evaluating my options' },
];

export const TIMELINE_OPTIONS: readonly FormOption[] = [
  { value: 'immediately', label: 'Immediately' },
  { value: '30-days', label: 'Within 30 days' },
  { value: '1-3-months', label: 'Within 1–3 months' },
  { value: '3-6-months', label: 'Within 3–6 months' },
  { value: '6-plus-months', label: 'More than 6 months from now' },
  { value: 'researching', label: 'I am only researching' },
];

export const CONSENT_TEXT =
  'I agree to be contacted by C786 Realty through WhatsApp, telephone, or email regarding relevant property opportunities.';

/* ───────────────────────────── FAQ ───────────────────────────── */

export const FAQS: readonly FaqItem[] = [
  {
    question: 'Can international buyers purchase property in Georgia?',
    answer:
      'Georgia permits foreign nationals to own residential property outright, and there is no requirement to hold residency in order to buy. Ownership rules and the process for registering title are set by Georgian law and can change, so we recommend confirming your own position with an independent Georgian lawyer before you commit.',
  },
  {
    question: 'What residence types are available?',
    answer:
      'Trussardi Residences offers studios from 38 m², one-bedroom apartments and two-bedroom apartments. Availability moves as the project sells, so ask us for the current release rather than relying on a published list.',
  },
  {
    question: 'Are the apartments fully furnished?',
    answer:
      'Yes. Residences are delivered fully furnished by Trussardi Casa, with integrated white goods, premium kitchen appliances and complete kitchenware included, so the property is move-in ready at handover. Final specification is defined in the sale documentation.',
  },
  {
    question: 'What is the current payment plan?',
    answer:
      'The developer publishes a 60/40 plan: 10% on booking, 10% within 30 days at pre-sale agreement signing, 10% at construction permit around month six, then 10% at twelve, twenty-one and thirty-six months from booking, with the remaining 40% on completion. Payment plans are subject to change and to the terms of your sale agreement.',
  },
  {
    question: 'When is the expected handover?',
    answer:
      'The developer’s published handover is Q3 2029. Completion dates on off-plan developments can move, and the contractual position is the one set out in your sale agreement.',
  },
  {
    question: 'Can property ownership support Georgian residency?',
    answer:
      'Property ownership in Georgia can support a residency permit of up to five years for qualifying buyers. Eligibility depends on the value of the property, your personal circumstances and immigration rules in force at the time. C786 Realty does not provide immigration advice — please take independent legal advice on your own eligibility.',
  },
  {
    question: 'Can C786 help with documentation?',
    answer:
      'Yes. We support you through reservation, the pre-sale agreement and the paperwork around the purchase, and coordinate with the developer on your behalf. We are not a law firm, so where independent legal or tax advice is needed we will tell you plainly.',
  },
  {
    question: 'Does C786 assist with property and rental management?',
    answer:
      'Yes. We help arrange management of the residence after handover, support rental positioning, and stay involved for resale when you decide to exit.',
  },
  {
    question: 'How can I receive current availability?',
    answer:
      'Complete the seven-question form on this page and a C786 Realty consultant will come back to you with current availability, verified pricing and the official project presentation. You can also message us directly on WhatsApp.',
  },
];

/* ───────────────────────────── Legal ───────────────────────────── */

/**
 * ⚠ NEEDS_CLIENT_INPUT — links to C786's own policy documents.
 * Until these are supplied they render as "pending" rather than as links to
 * routes that do not exist. This site is a single page with no router, so these
 * should point at hosted documents (or absolute URLs on the main C786 site).
 */
export const LEGAL = {
  privacyUrl: NEEDS_CLIENT_INPUT,
  termsUrl: NEEDS_CLIENT_INPUT,
} as const;

export const DISCLAIMER =
  'Project information, pricing, availability, payment plans, returns, residency eligibility, taxation, and legal requirements may change and remain subject to developer terms, applicable regulations, and independent professional advice. C786 Realty does not provide legal, immigration, financial, or tax advice.';

export const ATTRIBUTION = `${PROJECT.name} at ${PROJECT.community} is developed by ${PROJECT.developer}. Trussardi and Trussardi Casa are trademarks of their respective owners. Imagery is supplied by the developer and is indicative; renders do not form part of any contract. C786 Realty markets this project as an independent property consultancy.`;

export const SEO = {
  title: 'Trussardi Residences, Mira Verde Tbilisi | C786 Realty',
  description:
    'Explore fully furnished studios and 1–2 bedroom residences at Trussardi Residences, Mira Verde in Tbilisi. Request current pricing, availability and investment guidance from C786 Realty.',
  ogImage: '/media/hero-1600.webp',
} as const;

export const NAV_LINKS = [
  { id: 'overview', label: 'Overview' },
  { id: 'residences', label: 'Residences' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'location', label: 'Location' },
  { id: 'invest', label: 'Invest' },
  { id: 'enquire', label: 'Enquire' },
] as const;

export type NavId = (typeof NAV_LINKS)[number]['id'];

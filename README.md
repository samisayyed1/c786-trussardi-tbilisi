# C786 Realty — Trussardi Residences, Mira Verde (Tbilisi)

Single-page investment landing site for C786 Realty's Georgia campaign.

React 19 · Vite 8 · TypeScript (strict) · Tailwind CSS 4 · GSAP + ScrollTrigger · lucide-react

---

## Before you launch

Four things must be filled in. Everything else is done. Each one currently
renders as a visible **Pending** marker rather than as fake data or a dead link,
so nothing on the page can mislead a visitor while you gather them.

### 1. C786's contact details — `src/content/site.ts` → `CONTACT`

```ts
export const CONTACT: ContactConfig = {
  phone: '+971XXXXXXXXX',         // E.164, used for tel: links
  whatsappNumber: '971XXXXXXXXX', // digits only, no '+', used for wa.me
  email: 'hello@c786realty.com',
  whatsappMessage: '…',           // prefilled first message
};
```

Until these are set, every WhatsApp button renders disabled and labelled
"WhatsApp — number pending", and the footer shows a Pending chip. Filling them
in also switches on the `RealEstateAgent` structured-data node, which is
deliberately omitted while the details are unverified.

> Do **not** paste Mira Developments' contact details here. These must be C786's own.

### 2. Policy documents — `src/content/site.ts` → `LEGAL`

```ts
export const LEGAL = {
  privacyUrl: 'https://…/privacy',
  termsUrl: 'https://…/terms',
};
```

This is a single page with no router, so these should be absolute URLs to hosted
documents (for example on the main C786 site).

### 3. Environment variables — copy `.env.example` to `.env`

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Production origin, no trailing slash. Drives the canonical URL, Open Graph URL and absolute social image. |
| `VITE_LEAD_ENDPOINT` | Where the lead form delivers. Leave empty and the form will **not** claim success — it hands the completed answers to WhatsApp instead. |

`VITE_LEAD_ENDPOINT` accepts either a Google Form `…/formResponse` URL (posted
form-encoded and `no-cors`) or any endpoint that accepts a JSON POST and returns
2xx — Formspree, Make, n8n, or your own serverless function.

Nothing secret belongs in this file: it is compiled into the client bundle. The
endpoint must be safe to expose, with any credential held server-side.

### 4. `public/robots.txt`

Replace the example host in the `Sitemap:` line with your production domain.

---

## Editing the campaign

**All editable facts live in one file: `src/content/site.ts`.** Pricing, the
payment plan, handover date, areas, amenities, travel times, FAQs, disclaimers
and every piece of long-form copy are there. No component hard-codes a figure,
so C786 can update the campaign without touching any component.

Project figures were verified on **30 July 2026** against the official developer
sources and carry provenance notes in that file:

- <https://miradevelopments.ae/projects/trussardi-residences-tbilisi-georgia>
- <https://trussardi-residences.ge/>

No third-party property portal was used as a factual source.

---

## Media

Source files live in `media-src/`. `scripts/media.config.mjs` is the curated map:
each entry records the file, its kind, alt text, caption and **provenance URL**,
so any asset can be audited or swapped.

Every image on the site is a genuine Trussardi Residences / Mira Verde / Tbilisi
asset published by the developer — exteriors, interiors, amenities, the
masterplan, Tbilisi location photography, and the real studio / 1-bed / 2-bed
floor plans. There is no stock photography, no AI-generated architecture and no
imagery from any other project.

To swap in a client-supplied file: drop it into `media-src/`, update the `file`
field, and run:

```bash
pnpm media
```

Only changed assets are re-encoded, so swapping one image takes seconds rather
than re-running the whole set (`pnpm media:force` rebuilds everything).

That regenerates responsive AVIF + WebP derivatives into `public/media/` and
rewrites the typed manifest at `src/content/media-manifest.ts`, including
intrinsic dimensions (so there is no layout shift) and an inline blurred
placeholder.

The developer publishes no project video, so the hero is a cinematic still with a
slow GSAP push-in. An unrelated stock video is never substituted.

### Image resolution — the ceiling, and how to raise it

**Every render the developer publishes is 1920–2400px wide.** The hero original
is 2100×1568. Verified directly against their servers on 31 July 2026: there are
no larger files, and the CDN ignores resize parameters (`?w=3840` returns the
same 2100px image).

That matters on a retina desktop. A full-bleed hero at 1440 CSS px wants roughly
2900 device pixels; 2100 is all that exists. Everything else on the page — 32 of
the 34 images rendered on a 1440 screen — does serve at full 2× density. Only the
hero and the closing section are source-limited.

The site is not upscaling to close that gap. Upscaling invents detail that was
never rendered, and on architectural imagery it reliably looks worse than an
honest downscale.

**To get true 4K:** ask MIRA Developments for the original render files, which
will exist at print resolution internally. Drop them into `media-src/`, run
`pnpm media`, and they will be served automatically — the width tiers already go
to 2400 and the optimizer always emits the source's native width on top of that.
No code changes needed.

Encoder quality is scaled by tier in `scripts/media.config.mjs` (`qualityFor`).
Large tiers are encoded generously because these renders are full of smooth sky
and glass gradients, where aggressive AVIF quantisation shows as banding. Small
tiers stay lean — a 640px crop is painted into a few hundred CSS pixels on a
phone, so extra bytes there buy no visible sharpness and cost load time.

---

## Commands

```bash
pnpm install
pnpm dev                   # development server
pnpm build                 # typecheck + production build
pnpm preview               # serve the production build

pnpm lint                  # oxlint
pnpm typecheck             # tsc, strict

pnpm media                 # regenerate changed media + manifest (incremental)
pnpm media:force           # re-encode every asset from scratch

# Verification (needs a running preview server)
pnpm verify:viewports      # 320→1920: overflow, touch targets, alt text, headings, console
pnpm verify:interactions   # nav, lightbox, FAQ, map, form steps, mobile menu, swipe
pnpm verify:contrast       # real composited WCAG contrast of hero text over the render
pnpm verify:form <url>     # lead delivery: success, failure, retry, duplicate protection
pnpm shots <w> <h> <label> # scroll-through screenshots for visual review
```

---

## Notes on a few decisions

**The loading screen costs about 1.4s of Largest Contentful Paint.** It is a
full-screen opaque overlay, so nothing behind it counts as painted. It is held at
the short end of the 1.4–2s brief for exactly that reason, runs only once per
browsing session, is skipped entirely under `prefers-reduced-motion`, and the
hero entrance starts *as the overlay leaves* rather than after it. If mobile
performance ever matters more than the intro, shortening `DURATION_MS` in
`src/components/Preloader.tsx` is the single biggest lever.

**No animation library.** Scroll reveals and the form's step transition are a
small `useInView` hook plus CSS transitions. Dropping Framer Motion removed
~87 KB gzipped, more than half of which was unused, and was worth roughly two
Lighthouse points on mobile. GSAP stays for the hero timeline, the payment-plan
progress rail and the gallery parallax, and is code-split into its own chunk.

**The form never lies.** Success is only shown when the lead genuinely reached
the server. A failed request keeps every answer and offers a retry; an
unconfigured endpoint says so plainly and hands the answers to WhatsApp.

**No social proof is invented.** No testimonials, client counts, transaction
values, awards, partner logos, ratings or countdown timers appear anywhere,
because none were supplied. Conditional claims — the 8% rental guarantee,
residency, the warranty, foreign ownership — each carry a visible qualifier.

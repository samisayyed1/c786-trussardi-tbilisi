import { TRUST_POINTS } from '../content/site';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Trust points beneath the hero.
 *
 * On phones this runs as a continuous conveyor. It previously needed a manual
 * horizontal swipe, which meant most visitors only ever saw the first point and
 * a half — the second was always clipped mid-word. Auto-scrolling shows every
 * point without asking for an interaction.
 *
 * The sequence is rendered twice and the track travels exactly one sequence
 * width, so the loop is seamless with no visible jump. The duplicate is
 * aria-hidden, and the whole thing falls back to a static wrapped row for
 * reduced-motion users and from `md` up, where all six points simply fit.
 */
export function TrustStrip() {
  const reducedMotion = useReducedMotion();

  const item = (point: string, index: number) => (
    <li
      key={`${point}-${index}`}
      className="flex shrink-0 items-center border-r border-[hsl(var(--stroke))] py-4 pr-6 pl-6 text-[0.8125rem] whitespace-nowrap text-[hsl(var(--muted))]"
    >
      <span aria-hidden="true" className="accent-gradient mr-3 size-1 shrink-0 rounded-full" />
      {point}
    </li>
  );

  return (
    <aside
      aria-label="Why buyers work with C786 Realty"
      className="overflow-hidden border-y border-[hsl(var(--stroke))] bg-[hsl(var(--surface))]"
    >
      {/* Static, wrapped row: desktop, and anywhere motion is unwelcome. */}
      <ul
        className={`shell flex flex-wrap items-stretch justify-center ${
          reducedMotion ? 'flex' : 'hidden md:flex'
        }`}
      >
        {TRUST_POINTS.map((point) => (
          <li
            key={point}
            className="flex items-center border-r border-[hsl(var(--stroke))] px-5 py-4 text-[0.8125rem] text-[hsl(var(--muted))] last:border-r-0"
          >
            <span aria-hidden="true" className="accent-gradient mr-3 size-1 shrink-0 rounded-full" />
            {point}
          </li>
        ))}
      </ul>

      {/* Conveyor: phones and tablets, motion permitted. */}
      {reducedMotion ? null : (
        <div className="relative flex md:hidden">
          <ul className="trust-marquee flex shrink-0 items-stretch">
            {TRUST_POINTS.map(item)}
          </ul>
          <ul aria-hidden="true" className="trust-marquee flex shrink-0 items-stretch">
            {TRUST_POINTS.map(item)}
          </ul>

          {/* Feathered edges so points enter and leave rather than being cut. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[hsl(var(--surface))] to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[hsl(var(--surface))] to-transparent"
          />
        </div>
      )}
    </aside>
  );
}

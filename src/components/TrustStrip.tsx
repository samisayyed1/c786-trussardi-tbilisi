import { TRUST_POINTS } from '../content/site';

/**
 * Concise trust points directly beneath the hero.
 *
 * On narrow screens this is a horizontally swipeable rail with thin dividers;
 * from `md` up it settles into a static wrapped row.
 */
export function TrustStrip() {
  return (
    <aside aria-label="Why buyers work with C786 Realty" className="border-y border-[hsl(var(--stroke))] bg-[hsl(var(--surface))]">
      <ul className="no-scrollbar shell flex snap-x snap-mandatory items-stretch gap-0 overflow-x-auto md:flex-wrap md:justify-center md:overflow-visible">
        {TRUST_POINTS.map((point) => (
          <li
            key={point}
            className="flex shrink-0 snap-start items-center border-r border-[hsl(var(--stroke))] py-4 pr-5 pl-5 text-[0.8125rem] whitespace-nowrap text-[hsl(var(--muted))] first:pl-0 last:border-r-0 md:whitespace-normal"
          >
            <span aria-hidden="true" className="accent-gradient mr-3 size-1 shrink-0 rounded-full" />
            {point}
          </li>
        ))}
      </ul>
    </aside>
  );
}

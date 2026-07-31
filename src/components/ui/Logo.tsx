import { BRAND } from '../../content/site';

interface LogoProps {
  /** Renders the full "C786 REALTY" lockup rather than just the wordmark. */
  full?: boolean;
  className?: string;
}

/**
 * The C786 mark: an accent gradient ring beside the wordmark.
 *
 * The ring carries no glyph on purpose. A decorative letter would be counted as
 * visible text by assistive tooling and would no longer match the link's
 * accessible name. Supporting words are screen-reader-only, so the accessible
 * name still begins with the visible wordmark.
 */
export function Logo({ full = false, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden="true"
        className={`accent-gradient grid shrink-0 place-items-center rounded-full ${full ? 'size-8' : 'size-7'}`}
      >
        <span className={`rounded-full bg-[hsl(var(--bg))] ${full ? 'size-3.5' : 'size-3'}`} />
      </span>
      <span
        className={`font-semibold tracking-[0.16em] text-[hsl(var(--text))] uppercase ${
          full ? 'text-sm tracking-[0.18em]' : 'text-xs'
        }`}
      >
        {BRAND.wordmark}
        {full ? ` ${BRAND.wordmarkSuffix}` : ''}
      </span>
    </span>
  );
}

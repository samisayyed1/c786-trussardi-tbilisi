import type { ReactNode } from 'react';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Renders on the slightly raised surface rather than the page background. */
  surface?: boolean;
  'aria-labelledby'?: string;
}

/** A page section with consistent vertical rhythm and max-width discipline. */
export function Section({ id, children, className = '', surface = false, ...rest }: SectionProps) {
  return (
    <section
      id={id}
      // Anchor offset comes solely from `scroll-padding-top` on <html>; adding
      // scroll-margin here as well would double the offset.
      className={`relative py-20 md:py-28 lg:py-36 ${
        surface ? 'bg-[hsl(var(--surface))]' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/** Small tracked-out label that opens most sections. */
export function Eyebrow({ children, className = '' }: EyebrowProps) {
  return (
    <p
      className={`flex items-center gap-3 text-[0.6875rem] font-medium tracking-[0.22em] text-[hsl(var(--muted))] uppercase ${className}`}
    >
      <span aria-hidden="true" className="accent-gradient h-px w-6 shrink-0" />
      {children}
    </p>
  );
}

interface SectionHeadingProps {
  id?: string;
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'h3';
}

/** The large editorial heading used at the top of each section. */
export function SectionHeading({ id, children, className = '', as: Tag = 'h2' }: SectionHeadingProps) {
  return (
    <Tag id={id} className={`text-[clamp(2rem,5.5vw,3.75rem)] ${className}`}>
      {children}
    </Tag>
  );
}

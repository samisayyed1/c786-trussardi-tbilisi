import type { ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds of delay, used to stagger siblings. */
  delay?: number;
  as?: 'div' | 'li' | 'article';
}

/**
 * The single section-reveal primitive used across the page: a short rise and
 * fade the first time an element scrolls into view.
 *
 * Implemented with an IntersectionObserver and a CSS transition rather than an
 * animation library — this runs on nearly every section, so keeping it off the
 * critical path measurably improves first paint on mobile. With reduced motion
 * the children render immediately, fully visible, with no transform.
 */
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  if (reducedMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(26px)',
        transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: inView ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  );
}

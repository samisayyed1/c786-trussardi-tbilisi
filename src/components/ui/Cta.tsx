import type { ReactNode } from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../../content/site';
import { track, type AnalyticsEvent } from '../../lib/analytics';

const BASE =
  'touch-manipulation inline-flex min-h-11 items-center justify-center gap-2 px-6 text-sm font-medium tracking-wide transition-all duration-300 ease-out';

interface PrimaryCtaProps {
  children: ReactNode;
  /** Anchor target on the page. */
  href: string;
  event: AnalyticsEvent;
  className?: string;
}

/** The filled, light-on-dark primary action. Used for the main conversion path. */
export function PrimaryCta({ children, href, event, className = '' }: PrimaryCtaProps) {
  return (
    <a
      href={href}
      onClick={() => track(event)}
      className={`${BASE} rounded-full bg-[hsl(var(--text))] text-[hsl(var(--bg))] hover:bg-white hover:shadow-[0_8px_30px_-8px_rgba(137,170,204,0.55)] ${className}`}
    >
      {children}
    </a>
  );
}

interface SecondaryCtaProps {
  children: ReactNode;
  href: string;
  event: AnalyticsEvent;
  className?: string;
}

/** Outlined secondary action, with the accent revealed on hover. */
export function SecondaryCta({ children, href, event, className = '' }: SecondaryCtaProps) {
  return (
    <a
      href={href}
      onClick={() => track(event)}
      className={`${BASE} rounded-full border border-[hsl(var(--stroke))] text-[hsl(var(--text))] hover:border-[hsl(var(--accent-start))] hover:bg-white/[0.04] ${className}`}
    >
      {children}
    </a>
  );
}

interface WhatsAppCtaProps {
  children?: ReactNode;
  event: Extract<AnalyticsEvent, 'hero_whatsapp_click' | 'whatsapp_click'>;
  className?: string;
  /** Overrides the default prefilled message. */
  message?: string;
}

/**
 * WhatsApp handoff.
 *
 * When no WhatsApp number is configured yet, this renders as a disabled control
 * with an honest label rather than a dead link that appears to work.
 */
export function WhatsAppCta({ children = 'Speak on WhatsApp', event, className = '', message }: WhatsAppCtaProps) {
  const href = whatsappLink(message);

  if (href === null) {
    return (
      <span
        aria-disabled="true"
        title="A WhatsApp number has not been configured yet."
        className={`${BASE} cursor-not-allowed rounded-full border border-dashed border-[hsl(var(--stroke))] text-[hsl(var(--muted))] ${className}`}
      >
        <MessageCircle aria-hidden="true" className="size-4" />
        WhatsApp — number pending
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track(event)}
      className={`${BASE} rounded-full border border-[hsl(var(--stroke))] text-[hsl(var(--text))] hover:border-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/10 ${className}`}
    >
      <MessageCircle aria-hidden="true" className="size-4" />
      {children}
    </a>
  );
}

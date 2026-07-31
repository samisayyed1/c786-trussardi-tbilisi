import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../content/site';
import { track } from '../lib/analytics';

/**
 * Sticky bottom CTA bar for phones.
 *
 * Appears only after the hero has scrolled away, so it never covers the hero's
 * own buttons, and sits above the home indicator via the safe-area inset.
 * Hidden from `lg` up, where the floating nav already carries the CTA.
 */
export function MobileCtaBar() {
  const [visible, setVisible] = useState(false);
  const whatsapp = whatsappLink();

  useEffect(() => {
    const onScroll = (): void => setVisible(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[hsl(var(--stroke))] bg-[hsl(var(--bg))]/94 backdrop-blur-xl transition-transform duration-400 ease-out lg:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      // Keeps the bar out of the tab order while it is off-screen.
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <a
          href="#enquire"
          onClick={() => track('navigation_cta_click', { placement: 'mobile-bar' })}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[hsl(var(--text))] px-5 text-sm font-medium text-[hsl(var(--bg))]"
        >
          Get Prices &amp; Availability
        </a>

        {whatsapp === null ? null : (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Speak on WhatsApp"
            onClick={() => track('whatsapp_click', { placement: 'mobile-bar' })}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-[hsl(var(--stroke))] text-[hsl(var(--success))]"
          >
            <MessageCircle aria-hidden="true" className="size-5" />
          </a>
        )}
      </div>
    </div>
  );
}

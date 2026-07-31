import { Mail, MessageCircle, Phone } from 'lucide-react';
import { ATTRIBUTION, BRAND, CONTACT, DISCLAIMER, LEGAL, isPlaceholder, whatsappLink } from '../content/site';
import { track } from '../lib/analytics';
import { Logo } from './ui/Logo';

const YEAR = new Date().getFullYear();

interface ContactRowProps {
  icon: typeof Phone;
  label: string;
  value: string;
  href: string | null;
  onClick: () => void;
}

/**
 * A contact line. Renders as plain, clearly-pending text when the detail has
 * not been supplied yet, rather than as a link that goes nowhere.
 */
function ContactRow({ icon: Icon, label, value, href, onClick }: ContactRowProps) {
  const pending = href === null;

  return (
    <li>
      {pending ? (
        <span className="flex items-center gap-3 py-2 text-sm text-[hsl(var(--muted))]">
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          <span>
            {label}
            <span className="ml-2 rounded-full border border-dashed border-[hsl(var(--stroke))] px-2 py-0.5 text-[0.625rem] tracking-wide uppercase">
              Pending
            </span>
          </span>
        </span>
      ) : (
        <a
          href={href}
          onClick={onClick}
          className="flex min-h-11 items-center gap-3 text-sm text-[hsl(var(--muted))] transition-colors hover:text-[hsl(var(--text))]"
        >
          <Icon aria-hidden="true" className="size-4 shrink-0 text-[hsl(var(--accent-start))]" />
          {value}
        </a>
      )}
    </li>
  );
}

/**
 * A policy link. Shown as pending rather than pointing at a route that would
 * 404 — this is a single page with no router.
 */
function LegalLink({ label, url }: { label: string; url: string }) {
  if (isPlaceholder(url)) {
    return (
      <li>
        <span className="flex items-center gap-2 py-2 text-sm text-[hsl(var(--muted))]">
          {label}
          <span className="rounded-full border border-dashed border-[hsl(var(--stroke))] px-2 py-0.5 text-[0.625rem] tracking-wide uppercase">
            Pending
          </span>
        </span>
      </li>
    );
  }

  return (
    <li>
      <a
        href={url}
        className="flex min-h-11 items-center text-sm text-[hsl(var(--muted))] transition-colors hover:text-[hsl(var(--text))]"
      >
        {label}
      </a>
    </li>
  );
}

export function Footer() {
  const phonePending = isPlaceholder(CONTACT.phone);
  const emailPending = isPlaceholder(CONTACT.email);
  const whatsapp = whatsappLink();

  return (
    <footer className="border-t border-[hsl(var(--stroke))] bg-[hsl(var(--bg))] pt-16 pb-[calc(2.5rem+var(--mobile-cta-height))] lg:pb-10">
      <div className="shell">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <a href="#top" className="inline-flex min-h-11 items-center">
              <Logo full />
              <span className="sr-only">— back to top</span>
            </a>
            <p className="mt-5 max-w-xs text-sm text-[hsl(var(--muted))]">
              Independent property consultancy supporting international buyers across Georgia — before, during and
              after the purchase.
            </p>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-xs tracking-[0.16em] text-[hsl(var(--muted))] uppercase">Contact</h2>
            <ul className="mt-4 space-y-1">
              <ContactRow
                icon={Phone}
                label="Telephone"
                value={CONTACT.phone}
                href={phonePending ? null : `tel:${CONTACT.phone}`}
                onClick={() => track('phone_click')}
              />
              <ContactRow
                icon={MessageCircle}
                label="WhatsApp"
                value="WhatsApp"
                href={whatsapp}
                onClick={() => track('whatsapp_click')}
              />
              <ContactRow
                icon={Mail}
                label="Email"
                value={CONTACT.email}
                href={emailPending ? null : `mailto:${CONTACT.email}`}
                onClick={() => track('email_click')}
              />
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="text-xs tracking-[0.16em] text-[hsl(var(--muted))] uppercase">Legal</h2>
            <ul className="mt-4 space-y-1">
              <li>
                <a
                  href="#disclaimer"
                  className="flex min-h-11 items-center text-sm text-[hsl(var(--muted))] transition-colors hover:text-[hsl(var(--text))]"
                >
                  Investment disclaimer
                </a>
              </li>
              <LegalLink label="Privacy Policy" url={LEGAL.privacyUrl} />
              <LegalLink label="Terms" url={LEGAL.termsUrl} />
            </ul>
          </div>
        </div>

        <div id="disclaimer" className="mt-14 border-t border-[hsl(var(--stroke))] pt-8">
          <h2 className="text-xs tracking-[0.16em] text-[hsl(var(--muted))] uppercase">Investment disclaimer</h2>
          <p className="mt-3 max-w-4xl text-xs leading-relaxed text-[hsl(var(--muted))]">{DISCLAIMER}</p>
          <p className="mt-4 max-w-4xl text-xs leading-relaxed text-[hsl(var(--muted))]">{ATTRIBUTION}</p>
        </div>

        <p className="mt-10 text-xs text-[hsl(var(--muted))]">
          © {YEAR} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../content/site';
import { Logo } from './ui/Logo';
import { useActiveSection } from '../hooks/useActiveSection';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { track } from '../lib/analytics';

const SECTION_IDS = NAV_LINKS.map((link) => link.id);

/**
 * Fixed floating pill navigation.
 *
 * Highlights the section in view via IntersectionObserver, gains elevation once
 * the page has scrolled, and collapses to a full-screen sheet on mobile with
 * focus trapping and Escape-to-close.
 */
export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(menuOpen);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape closes the sheet and returns focus to the control that opened it.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <a
        href="#overview"
        className="sr-only rounded-full bg-[hsl(var(--text))] text-sm font-medium text-[hsl(var(--bg))] focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:inline-flex focus:min-h-11 focus:items-center focus:px-5"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-5">
        <nav
          aria-label="Primary"
          className={`flex w-full max-w-3xl items-center gap-2 rounded-full border px-2 py-2 transition-all duration-500 ease-out md:gap-3 md:px-3 ${
            scrolled
              ? 'border-[hsl(var(--stroke))] bg-[hsl(var(--bg))]/88 shadow-[0_10px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl'
              : 'border-transparent bg-[hsl(var(--bg))]/45 backdrop-blur-md'
          }`}
        >
          <a href="#top" className="flex min-h-11 shrink-0 items-center rounded-full pr-2 pl-3">
            <Logo />
            <span className="sr-only">Realty — back to top</span>
          </a>

          <ul className="mx-auto hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.id;
              return (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative block rounded-full px-3.5 py-2 text-[0.8125rem] transition-colors duration-300 ${
                      isActive
                        ? 'text-[hsl(var(--text))]'
                        : 'text-[hsl(var(--muted))] hover:text-[hsl(var(--text))]'
                    }`}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={`accent-gradient absolute inset-x-3.5 bottom-1 h-px origin-center transition-transform duration-300 ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <a
            href="#enquire"
            onClick={() => track('navigation_cta_click')}
            className="ml-auto hidden min-h-11 shrink-0 items-center rounded-full bg-[hsl(var(--text))] px-5 text-[0.8125rem] font-medium whitespace-nowrap text-[hsl(var(--bg))] transition-colors duration-300 hover:bg-white lg:inline-flex"
          >
            Get Details
          </a>

          <div className="ml-auto flex items-center gap-1.5 lg:hidden">
            <a
              href="#enquire"
              onClick={() => track('navigation_cta_click')}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-[hsl(var(--text))] px-4 text-[0.8125rem] font-medium whitespace-nowrap text-[hsl(var(--bg))]"
            >
              Get Details
            </a>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-[hsl(var(--stroke))] text-[hsl(var(--text))]"
            >
              {menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      <div
        id="mobile-nav-panel"
        ref={panelRef}
        hidden={!menuOpen}
        className="fixed inset-0 z-40 flex flex-col justify-center bg-[hsl(var(--bg))]/97 px-8 backdrop-blur-xl lg:hidden"
      >
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link, index) => (
            <li key={link.id} className="border-b border-[hsl(var(--stroke))] last:border-b-0">
              <a
                href={`#${link.id}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-baseline gap-4 py-4 text-2xl text-[hsl(var(--text))]"
              >
                <span className="font-mono text-[0.625rem] tracking-widest text-[hsl(var(--muted))]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

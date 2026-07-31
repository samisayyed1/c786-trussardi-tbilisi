import { useState } from 'react';
import { Plus } from 'lucide-react';
import { FAQS } from '../content/site';
import { Reveal } from './ui/Reveal';
import { Eyebrow, Section, SectionHeading } from './ui/Section';

/**
 * Accordion FAQ.
 *
 * Uses buttons with `aria-expanded` over native <details> so the open/closed
 * state is fully controlled and announced consistently. Matches the FAQPage
 * structured data emitted in `main.tsx` exactly.
 */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section aria-labelledby="faq-heading">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <Eyebrow>Questions</Eyebrow>
              <SectionHeading id="faq-heading" className="mt-6">
                Before You <span className="font-display">Enquire</span>
              </SectionHeading>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <dl className="border-t border-[hsl(var(--stroke))]">
              {FAQS.map((faq, index) => {
                const isOpen = openIndex === index;
                const panelId = `faq-panel-${index}`;
                const buttonId = `faq-button-${index}`;

                return (
                  <div key={faq.question} className="border-b border-[hsl(var(--stroke))]">
                    <dt>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:text-[hsl(var(--accent-start))]"
                      >
                        <span className="text-base text-[hsl(var(--text))] md:text-lg">{faq.question}</span>
                        <Plus
                          aria-hidden="true"
                          className={`mt-1 size-4 shrink-0 text-[hsl(var(--muted))] transition-transform duration-300 ${
                            isOpen ? 'rotate-45' : ''
                          }`}
                        />
                      </button>
                    </dt>
                    {/* No role="region" here: `region` is not a permitted role
                        on <dd>, and it breaks the dt/dd grouping for the a11y
                        tree. aria-expanded + aria-controls already convey it. */}
                    <dd
                      id={panelId}
                      hidden={!isOpen}
                      className="pr-8 pb-6 text-sm text-[hsl(var(--muted))]"
                    >
                      {faq.answer}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </Section>
  );
}

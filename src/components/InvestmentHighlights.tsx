import { INVESTMENT_HIGHLIGHTS } from '../content/site';
import { CountUp } from './ui/CountUp';
import { Reveal } from './ui/Reveal';
import { Eyebrow, Section, SectionHeading } from './ui/Section';

/**
 * The investment case, stated as verified facts.
 *
 * Every conditional claim carries a visible qualifier — nothing here is
 * presented as guaranteed or risk-free.
 */
export function InvestmentHighlights() {
  return (
    <Section id="invest" aria-labelledby="invest-heading">
      <div className="shell">
        <Reveal>
          <Eyebrow>The investment case</Eyebrow>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading id="invest-heading" className="max-w-2xl">
              The Numbers <span className="font-display">That Matter</span>
            </SectionHeading>
            <p className="max-w-sm text-sm text-[hsl(var(--muted))]">
              Figures published by the developer and verified against official sources. They are not a forecast of your
              individual return.
            </p>
          </div>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-px border border-[hsl(var(--stroke))] bg-[hsl(var(--stroke))] sm:grid-cols-2 lg:grid-cols-3">
          {INVESTMENT_HIGHLIGHTS.map((highlight, position) => (
            <Reveal as="li" key={highlight.label} delay={position * 0.06} className="bg-[hsl(var(--bg))]">
              <div className="flex h-full flex-col p-7 md:p-8">
                <p className="text-[clamp(2.5rem,6vw,3.5rem)] leading-none text-[hsl(var(--text))]">
                  {highlight.countTo === undefined ? (
                    highlight.value
                  ) : (
                    <CountUp to={highlight.countTo} suffix={highlight.countSuffix} />
                  )}
                </p>
                <p className="mt-4 text-sm font-medium text-[hsl(var(--text))]">{highlight.label}</p>
                <p className="mt-2 text-sm text-[hsl(var(--muted))]">{highlight.detail}</p>
                {highlight.qualifier ? (
                  <p className="mt-auto pt-5 text-[0.6875rem] tracking-wide text-[hsl(var(--muted))] italic">
                    {highlight.qualifier}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}

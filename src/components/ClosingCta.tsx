import { MEDIA } from '../content/media-manifest';
import { Picture } from './ui/Picture';
import { Reveal } from './ui/Reveal';
import { PrimaryCta, WhatsAppCta } from './ui/Cta';

const MARQUEE_WORDS = ['Tbilisi', 'Trussardi', 'Mira Verde', 'C786 Realty'];

/** Two copies of the sequence, so the -50% translation loops seamlessly. */
const MARQUEE_SEQUENCE = [...MARQUEE_WORDS, ...MARQUEE_WORDS];

/** Cinematic closing section over a genuine night render of the community. */
export function ClosingCta() {
  return (
    <section aria-labelledby="closing-heading" className="relative overflow-hidden py-24 md:py-36">
      <div className="absolute inset-0 -z-10">
        <Picture
          asset={MEDIA.closing}
          sizes="100vw"
          className="size-full"
          imgClassName="object-cover object-center"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/72" />

      <div aria-hidden="true" className="mb-16 flex overflow-hidden select-none md:mb-20">
        <div className="marquee-track flex shrink-0 items-center gap-6 pr-6 whitespace-nowrap">
          {MARQUEE_SEQUENCE.map((word, index) => (
            <span key={`${word}-${index}`} className="flex items-center gap-6">
              <span className="font-display text-[clamp(2rem,7vw,4.5rem)] text-[hsl(var(--text))]/22">{word}</span>
              <span className="accent-gradient size-1.5 rounded-full" />
            </span>
          ))}
        </div>
      </div>

      <div className="shell text-center">
        <Reveal>
          <h2 id="closing-heading" className="mx-auto max-w-3xl text-[clamp(2rem,6vw,4rem)]">
            Explore Your <span className="font-display">Georgia Property</span> Options
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[hsl(var(--muted))]">
            Receive current availability, verified pricing, and guidance based on your investment goals.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryCta href="#enquire" event="brochure_request_click" className="w-full sm:w-auto">
              Get Prices &amp; Availability
            </PrimaryCta>
            <WhatsAppCta event="whatsapp_click" className="w-full sm:w-auto" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

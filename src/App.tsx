import { useCallback, useState } from 'react';
import { Preloader } from './components/Preloader';
import { introAlreadyPlayed } from './lib/intro';
import { FloatingNav } from './components/FloatingNav';
import { Hero } from './components/Hero';
import { TrustStrip } from './components/TrustStrip';
import { Overview } from './components/Overview';
import { Residences } from './components/Residences';
import { InvestmentHighlights } from './components/InvestmentHighlights';
import { PaymentPlan } from './components/PaymentPlan';
import { Amenities } from './components/Amenities';
import { Gallery } from './components/Gallery';
import { Location } from './components/Location';
import { WhyC786 } from './components/WhyC786';
import { LeadForm } from './components/LeadForm';
import { Faq } from './components/Faq';
import { ClosingCta } from './components/ClosingCta';
import { Footer } from './components/Footer';
import { MobileCtaBar } from './components/MobileCtaBar';

export default function App() {
  // The intro runs once per session; on later visits the hero animates straight away.
  const alreadyPlayed = introAlreadyPlayed();

  // Two separate flags on purpose: the hero starts animating as the overlay
  // begins to leave, while the overlay stays mounted until its exit finishes.
  const [heroReady, setHeroReady] = useState(alreadyPlayed);
  const [introMounted, setIntroMounted] = useState(!alreadyPlayed);

  const handleExitStart = useCallback(() => setHeroReady(true), []);
  const handleFinished = useCallback(() => setIntroMounted(false), []);

  return (
    <>
      {introMounted ? <Preloader onExitStart={handleExitStart} onFinished={handleFinished} /> : null}

      <FloatingNav />

      <main>
        <Hero ready={heroReady} />
        <TrustStrip />
        <Overview />
        <Residences />
        <InvestmentHighlights />
        <PaymentPlan />
        <Amenities />
        <Gallery />
        <Location />
        <WhyC786 />
        <LeadForm />
        <Faq />
        <ClosingCta />
      </main>

      <Footer />
      <MobileCtaBar />
    </>
  );
}

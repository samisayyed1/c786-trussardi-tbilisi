import { BRAND, CONTACT, FAQS, PROJECT, RESIDENCES, SEO, isPlaceholder } from '../content/site';

/**
 * Structured data for the page.
 *
 * Only emits what is genuinely verifiable. No review or rating markup is
 * produced — no reviews have been supplied — and the Organization node is
 * omitted entirely until C786's own contact details are configured.
 */
export function buildStructuredData(): Record<string, unknown> {
  const graph: Record<string, unknown>[] = [];
  const pageUrl = BRAND.siteUrl;

  graph.push({
    '@type': 'WebSite',
    '@id': `${pageUrl}/#website`,
    url: pageUrl,
    name: SEO.title,
    description: SEO.description,
    inLanguage: 'en',
  });

  // Organization is only valid once real, verified contact details exist.
  const contactVerified =
    !isPlaceholder(CONTACT.phone) && !isPlaceholder(CONTACT.email) && !isPlaceholder(BRAND.siteUrl);

  if (contactVerified) {
    graph.push({
      '@type': 'RealEstateAgent',
      '@id': `${pageUrl}/#organization`,
      name: BRAND.name,
      url: pageUrl,
      telephone: CONTACT.phone,
      email: CONTACT.email,
      areaServed: PROJECT.country,
    });
  }

  graph.push({
    '@type': 'Residence',
    '@id': `${pageUrl}/#residence`,
    name: `${PROJECT.name}, ${PROJECT.community}`,
    description: SEO.description,
    url: pageUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: PROJECT.city,
      addressCountry: 'GE',
    },
    containsPlace: RESIDENCES.map((residence) => ({
      '@type': 'Accommodation',
      name: residence.name,
      floorSize: {
        '@type': 'QuantitativeValue',
        value: Number.parseFloat(residence.areaFrom),
        unitCode: 'MTK',
      },
    })),
  });

  // Mirrors the visible FAQ accordion one-for-one.
  graph.push({
    '@type': 'FAQPage',
    '@id': `${pageUrl}/#faq`,
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  });

  return { '@context': 'https://schema.org', '@graph': graph };
}

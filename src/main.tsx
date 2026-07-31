import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BRAND, SEO } from './content/site';
import { buildStructuredData } from './lib/structuredData';
import './index.css';

/**
 * Applies the document metadata that depends on runtime configuration — the
 * canonical URL and the absolute OG image — which cannot be baked into the
 * static `index.html` because the site URL is an environment variable.
 */
function applyMetadata(): void {
  // VITE_SITE_URL already includes any subpath the site is deployed under, so
  // the OG image is built from it directly. Running the path through asset()
  // here would apply the base a second time.
  const canonicalUrl = BRAND.siteUrl.replace(/\/$/, '');

  const setMeta = (selector: string, attribute: string, value: string): void => {
    document.head.querySelector(selector)?.setAttribute(attribute, value);
  };

  setMeta('link[rel="canonical"]', 'href', canonicalUrl);
  setMeta('meta[property="og:url"]', 'content', canonicalUrl);
  setMeta('meta[property="og:image"]', 'content', `${canonicalUrl}${SEO.ogImage}`);
  setMeta('meta[name="twitter:image"]', 'content', `${canonicalUrl}${SEO.ogImage}`);

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(buildStructuredData());
  document.head.appendChild(script);
}

applyMetadata();

const container = document.getElementById('root');
if (!container) throw new Error('Root container #root was not found in the document.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

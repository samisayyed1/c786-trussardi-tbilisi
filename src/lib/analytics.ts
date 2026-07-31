/**
 * Conversion tracking.
 *
 * This project ships no third-party analytics vendor of its own. Events are
 * pushed to `window.dataLayer` (the GTM convention) when a container is present,
 * and forwarded to `gtag` when one is present. If neither exists, events are a
 * no-op — nothing is loaded, nothing is sent, and no consent is implied.
 *
 * To wire a vendor up, add its snippet in `index.html` behind your consent
 * mechanism; every event below will start flowing without touching components.
 */

export type AnalyticsEvent =
  | 'hero_primary_cta_click'
  | 'hero_whatsapp_click'
  | 'navigation_cta_click'
  | 'residence_availability_click'
  | 'brochure_request_click'
  | 'lead_form_start'
  | 'lead_form_step_complete'
  | 'lead_form_submit'
  | 'lead_form_success'
  | 'lead_form_error'
  | 'whatsapp_click'
  | 'phone_click'
  | 'email_click'
  | 'gallery_open';

type EventPayload = Record<string, string | number | boolean | undefined>;

interface AnalyticsWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (command: 'event', name: string, params?: EventPayload) => void;
}

/**
 * Records a conversion event. Safe to call during render-adjacent handlers:
 * it never throws, and it never blocks the interaction it is measuring.
 */
export function track(event: AnalyticsEvent, payload: EventPayload = {}): void {
  if (typeof window === 'undefined') return;

  const scope = window as AnalyticsWindow;
  const detail = { event, ...payload };

  try {
    if (Array.isArray(scope.dataLayer)) scope.dataLayer.push(detail);
    scope.gtag?.('event', event, payload);

    if (import.meta.env.DEV) {
      // Makes the event stream visible while developing, without a vendor.
      console.debug('[analytics]', event, payload);
    }
  } catch {
    // Measurement must never break the user's journey.
  }
}

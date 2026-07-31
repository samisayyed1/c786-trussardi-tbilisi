import { FORM } from '../content/site';

export interface LeadPayload {
  propertyType: string;
  budget: string;
  funding: string;
  timeline: string;
  fullName: string;
  phone: string;
  email: string;
  consent: boolean;
  /** Where the lead came from, so C786 can attribute the campaign. */
  source: string;
  submittedAt: string;
}

export type LeadResult =
  | { status: 'delivered' }
  /** No endpoint is configured, so the answers must be handed over another way. */
  | { status: 'no-endpoint' }
  | { status: 'failed'; message: string };

/** True when a lead destination has been configured for this deployment. */
export const hasLeadEndpoint = (): boolean => FORM.endpoint.trim().length > 0;

/**
 * Delivers a lead to the configured endpoint.
 *
 * Returns a discriminated result rather than throwing, so the form can only ever
 * show a success state when delivery genuinely succeeded. Google Form endpoints
 * are posted as form-encoded `no-cors` requests, which are opaque by design —
 * these are reported as delivered only because the request left the browser, and
 * teams using a Google Form should verify receipt in the responses sheet.
 */
export async function submitLead(payload: LeadPayload, signal?: AbortSignal): Promise<LeadResult> {
  const endpoint = FORM.endpoint.trim();
  if (endpoint.length === 0) return { status: 'no-endpoint' };

  try {
    const isGoogleForm = endpoint.includes('docs.google.com');

    if (isGoogleForm) {
      // Google Forms rejects cross-origin JSON and never returns a readable
      // response; form-encoded + no-cors is the only shape it accepts.
      const body = new URLSearchParams();
      for (const [key, value] of Object.entries(payload)) body.append(key, String(value));

      await fetch(endpoint, { method: 'POST', mode: 'no-cors', body, signal });
      return { status: 'delivered' };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      return { status: 'failed', message: `The server responded with ${response.status}.` };
    }

    return { status: 'delivered' };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { status: 'failed', message: 'The request was cancelled.' };
    }
    return {
      status: 'failed',
      message: 'We could not reach the server. Please check your connection and try again.',
    };
  }
}

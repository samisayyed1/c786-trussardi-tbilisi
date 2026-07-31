import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import {
  BUDGET_OPTIONS,
  CONSENT_TEXT,
  FUNDING_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
  type FormOption,
} from '../content/site';
import { COUNTRIES, DEFAULT_COUNTRY_ISO } from '../lib/countries';
import { hasLeadEndpoint, submitLead, type LeadPayload } from '../lib/leads';
import { track } from '../lib/analytics';
import { Reveal } from './ui/Reveal';
import { Eyebrow, Section, SectionHeading } from './ui/Section';
import { WhatsAppCta } from './ui/Cta';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Answers {
  propertyType: string;
  budget: string;
  funding: string;
  timeline: string;
  fullName: string;
  countryIso: string;
  phone: string;
  email: string;
  consent: boolean;
}

const EMPTY_ANSWERS: Answers = {
  propertyType: '',
  budget: '',
  funding: '',
  timeline: '',
  fullName: '',
  countryIso: DEFAULT_COUNTRY_ISO,
  phone: '',
  email: '',
  consent: false,
};

const CHOICE_STEPS = [
  { key: 'propertyType', question: 'What type of property are you interested in?', options: PROPERTY_TYPE_OPTIONS },
  { key: 'budget', question: 'What is your approximate investment budget?', options: BUDGET_OPTIONS },
  { key: 'funding', question: 'How do you plan to fund your purchase?', options: FUNDING_OPTIONS },
  { key: 'timeline', question: 'When are you considering purchasing?', options: TIMELINE_OPTIONS },
] as const satisfies readonly { key: keyof Answers; question: string; options: readonly FormOption[] }[];

/** Four choice steps plus one combined contact step. */
const TOTAL_STEPS = CHOICE_STEPS.length + 1;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'delivered' }
  | { kind: 'handoff' }
  | { kind: 'error'; message: string };

/**
 * Seven-question lead qualification form.
 *
 * Answers persist across steps and survive a failed submission, so a visitor
 * never has to start again. Success is only ever claimed when the lead was
 * genuinely delivered; when no endpoint is configured the completed answers are
 * handed to WhatsApp instead of being silently dropped.
 */
export function LeadForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [showErrors, setShowErrors] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: 'idle' });
  const startedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const headingRef = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();
  const formId = useId();

  // Abort any in-flight submission if the visitor leaves the page.
  useEffect(() => () => abortRef.current?.abort(), []);

  const country = COUNTRIES.find((entry) => entry.iso === answers.countryIso) ?? COUNTRIES[0];
  const fullPhone = `${country.dial} ${answers.phone.trim()}`.trim();

  const update = <K extends keyof Answers>(key: K, value: Answers[K]): void => {
    if (!startedRef.current) {
      startedRef.current = true;
      track('lead_form_start');
    }
    setAnswers((previous) => ({ ...previous, [key]: value }));
  };

  const contactErrors = useMemo(() => {
    const errors: Partial<Record<'fullName' | 'phone' | 'email' | 'consent', string>> = {};
    if (answers.fullName.trim().length < 2) errors.fullName = 'Please enter your full name.';
    // Loose on purpose: national number lengths vary widely and a strict rule
    // rejects real numbers, which costs leads.
    if (answers.phone.replace(/\D/g, '').length < 6) errors.phone = 'Please enter a valid WhatsApp number.';
    if (!EMAIL_PATTERN.test(answers.email.trim())) errors.email = 'Please enter a valid email address.';
    if (!answers.consent) errors.consent = 'Please confirm you are happy to be contacted.';
    return errors;
  }, [answers]);

  const isContactStep = step === CHOICE_STEPS.length;
  const currentChoice = isContactStep ? null : CHOICE_STEPS[step];
  const choiceAnswered = currentChoice ? answers[currentChoice.key] !== '' : true;
  const canAdvance = isContactStep ? Object.keys(contactErrors).length === 0 : choiceAnswered;

  const goNext = (): void => {
    if (!canAdvance) {
      setShowErrors(true);
      return;
    }
    track('lead_form_step_complete', { step: step + 1 });
    setShowErrors(false);
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
    headingRef.current?.focus();
  };

  const goBack = (): void => {
    setShowErrors(false);
    setStep((current) => Math.max(current - 1, 0));
    headingRef.current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (submitState.kind === 'submitting') return; // Duplicate-submission guard.

    if (!canAdvance) {
      setShowErrors(true);
      return;
    }

    setSubmitState({ kind: 'submitting' });
    track('lead_form_submit');

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const payload: LeadPayload = {
      propertyType: labelFor(PROPERTY_TYPE_OPTIONS, answers.propertyType),
      budget: labelFor(BUDGET_OPTIONS, answers.budget),
      funding: labelFor(FUNDING_OPTIONS, answers.funding),
      timeline: labelFor(TIMELINE_OPTIONS, answers.timeline),
      fullName: answers.fullName.trim(),
      phone: fullPhone,
      email: answers.email.trim(),
      consent: answers.consent,
      source: 'trussardi-residences-landing',
      submittedAt: new Date().toISOString(),
    };

    const result = await submitLead(payload, controller.signal);

    if (result.status === 'delivered') {
      setSubmitState({ kind: 'delivered' });
      track('lead_form_success');
      return;
    }

    if (result.status === 'no-endpoint') {
      // Honest fallback: we did NOT store the lead, so we don't claim we did.
      setSubmitState({ kind: 'handoff' });
      track('lead_form_error', { reason: 'no-endpoint' });
      return;
    }

    setSubmitState({ kind: 'error', message: result.message });
    track('lead_form_error', { reason: 'request-failed' });
  };

  const summaryMessage = buildWhatsAppSummary(answers, fullPhone);

  return (
    <Section id="enquire" surface aria-labelledby="enquire-heading">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>Enquire</Eyebrow>
              <SectionHeading id="enquire-heading" className="mt-6">
                Receive Prices, Availability and the <span className="font-display">Project Presentation</span>
              </SectionHeading>
              <p className="mt-6 text-[hsl(var(--muted))]">
                Answer seven quick questions and a C786 Realty consultant will contact you with suitable options.
              </p>
              <p className="mt-6 text-sm text-[hsl(var(--muted))]">
                Prefer to talk first? Message us directly and we will send the presentation over.
              </p>
              <WhatsAppCta event="whatsapp_click" className="mt-4" />
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.08}>
              <div className="rounded-lg border border-[hsl(var(--stroke))] bg-[hsl(var(--bg))] p-6 md:p-9">
                {submitState.kind === 'delivered' || submitState.kind === 'handoff' ? (
                  <Outcome state={submitState} message={summaryMessage} />
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Progress */}
                    <div className="mb-8">
                      <div className="flex items-baseline justify-between">
                        <p
                          ref={headingRef}
                          tabIndex={-1}
                          aria-live="polite"
                          className="text-xs tracking-[0.16em] text-[hsl(var(--muted))] uppercase outline-none"
                        >
                          Step {step + 1} of {TOTAL_STEPS}
                        </p>
                        <p className="font-mono text-xs text-[hsl(var(--muted))] tabular-nums">
                          {Math.round(((step + 1) / TOTAL_STEPS) * 100)}%
                        </p>
                      </div>
                      <div className="mt-3 h-px w-full bg-[hsl(var(--stroke))]">
                        <div
                          className="accent-gradient h-full origin-left transition-transform duration-500 ease-out"
                          style={{ transform: `scaleX(${(step + 1) / TOTAL_STEPS})` }}
                        />
                      </div>
                    </div>

                    {/* `key` remounts on step change, replaying the entry
                        transition — the same effect as an exit/enter pair,
                        without pulling in an animation runtime. */}
                    <div
                      key={step}
                      style={
                        reducedMotion
                          ? undefined
                          : { animation: 'form-step-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both' }
                      }
                    >
                        {currentChoice ? (
                          <fieldset className="border-0 p-0">
                            <legend className="mb-6 text-xl text-[hsl(var(--text))] md:text-2xl">
                              {currentChoice.question}
                            </legend>
                            <div className="space-y-2">
                              {currentChoice.options.map((option) => {
                                const selected = answers[currentChoice.key] === option.value;
                                return (
                                  <label
                                    key={option.value}
                                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors duration-200 ${
                                      selected
                                        ? 'border-[hsl(var(--accent-start))] bg-[hsl(var(--accent-start))]/8 text-[hsl(var(--text))]'
                                        : 'border-[hsl(var(--stroke))] text-[hsl(var(--muted))] hover:border-[hsl(var(--muted))] hover:text-[hsl(var(--text))]'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`${formId}-${currentChoice.key}`}
                                      value={option.value}
                                      checked={selected}
                                      onChange={() => {
                                        update(currentChoice.key, option.value);
                                        setShowErrors(false);
                                      }}
                                      className="sr-only"
                                    />
                                    <span
                                      aria-hidden="true"
                                      className={`grid size-4 shrink-0 place-items-center rounded-full border transition-colors ${
                                        selected
                                          ? 'border-[hsl(var(--accent-start))]'
                                          : 'border-[hsl(var(--stroke))]'
                                      }`}
                                    >
                                      {selected ? (
                                        <span className="accent-gradient size-2 rounded-full" />
                                      ) : null}
                                    </span>
                                    {option.label}
                                  </label>
                                );
                              })}
                            </div>
                            {showErrors && !choiceAnswered ? (
                              <p role="alert" className="mt-4 flex items-center gap-2 text-sm text-red-400">
                                <AlertCircle aria-hidden="true" className="size-4" />
                                Please choose an option to continue.
                              </p>
                            ) : null}
                          </fieldset>
                        ) : (
                          <div>
                            <h3 className="mb-6 text-xl text-[hsl(var(--text))] md:text-2xl">
                              Where should we send your options?
                            </h3>

                            <div className="space-y-5">
                              <Field
                                id={`${formId}-name`}
                                label="Full name"
                                error={showErrors ? contactErrors.fullName : undefined}
                              >
                                <input
                                  id={`${formId}-name`}
                                  type="text"
                                  name="name"
                                  autoComplete="name"
                                  enterKeyHint="next"
                                  value={answers.fullName}
                                  onChange={(event) => update('fullName', event.target.value)}
                                  className={inputClass(showErrors && contactErrors.fullName)}
                                />
                              </Field>

                              <Field
                                id={`${formId}-phone`}
                                label="WhatsApp number"
                                hint="Include your country code."
                                error={showErrors ? contactErrors.phone : undefined}
                              >
                                <div className="flex gap-2">
                                  <select
                                    aria-label="Country dialling code"
                                    value={answers.countryIso}
                                    onChange={(event) => update('countryIso', event.target.value)}
                                    className={`${inputClass(false)} w-32 shrink-0`}
                                  >
                                    {COUNTRIES.map((entry) => (
                                      <option key={entry.iso} value={entry.iso}>
                                        {entry.flag} {entry.dial}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    id={`${formId}-phone`}
                                    type="tel"
                                    name="tel"
                                    inputMode="tel"
                                    autoComplete="tel-national"
                                    enterKeyHint="next"
                                    value={answers.phone}
                                    onChange={(event) => update('phone', event.target.value)}
                                    className={inputClass(showErrors && contactErrors.phone)}
                                  />
                                </div>
                              </Field>

                              <Field
                                id={`${formId}-email`}
                                label="Email address"
                                error={showErrors ? contactErrors.email : undefined}
                              >
                                <input
                                  id={`${formId}-email`}
                                  type="email"
                                  name="email"
                                  inputMode="email"
                                  autoComplete="email"
                                  enterKeyHint="done"
                                  value={answers.email}
                                  onChange={(event) => update('email', event.target.value)}
                                  className={inputClass(showErrors && contactErrors.email)}
                                />
                              </Field>

                              <label className="flex cursor-pointer items-start gap-3 text-sm text-[hsl(var(--muted))]">
                                <input
                                  type="checkbox"
                                  checked={answers.consent}
                                  onChange={(event) => update('consent', event.target.checked)}
                                  required
                                  className="mt-0.5 size-4 shrink-0 accent-[hsl(var(--accent-end))]"
                                />
                                <span>{CONSENT_TEXT}</span>
                              </label>
                              {showErrors && contactErrors.consent ? (
                                <p role="alert" className="flex items-center gap-2 text-sm text-red-400">
                                  <AlertCircle aria-hidden="true" className="size-4" />
                                  {contactErrors.consent}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        )}
                    </div>

                    {submitState.kind === 'error' ? (
                      <div
                        role="alert"
                        className="mt-6 flex items-start gap-3 rounded-md border border-red-500/40 bg-red-500/8 p-4 text-sm text-red-300"
                      >
                        <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        <span>
                          {submitState.message} Your answers have been kept — you can try again, or send them straight
                          to us on WhatsApp.
                        </span>
                      </div>
                    ) : null}

                    <div className="mt-8 flex items-center gap-3">
                      {step > 0 ? (
                        <button
                          type="button"
                          onClick={goBack}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[hsl(var(--stroke))] px-5 text-sm text-[hsl(var(--text))] transition-colors hover:border-[hsl(var(--accent-start))]"
                        >
                          <ArrowLeft aria-hidden="true" className="size-4" />
                          Back
                        </button>
                      ) : null}

                      {isContactStep ? (
                        <button
                          type="submit"
                          disabled={submitState.kind === 'submitting'}
                          className="ml-auto inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[hsl(var(--text))] px-6 text-sm font-medium text-[hsl(var(--bg))] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                        >
                          {submitState.kind === 'submitting' ? (
                            <>
                              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                              Sending…
                            </>
                          ) : (
                            <>
                              Send Me the Project Details
                              <ArrowRight aria-hidden="true" className="size-4" />
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={goNext}
                          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--text))] px-6 text-sm font-medium text-[hsl(var(--bg))] transition-colors hover:bg-white"
                        >
                          Continue
                          <ArrowRight aria-hidden="true" className="size-4" />
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ───────────────────────────── Helpers ───────────────────────────── */

const labelFor = (options: readonly FormOption[], value: string): string =>
  options.find((option) => option.value === value)?.label ?? value;

const inputClass = (invalid: string | false | undefined): string =>
  `min-h-11 w-full rounded-md border bg-[hsl(var(--surface))] px-4 text-base text-[hsl(var(--text))] transition-colors placeholder:text-[hsl(var(--muted))] ${
    invalid ? 'border-red-500/60' : 'border-[hsl(var(--stroke))] focus:border-[hsl(var(--accent-start))]'
  }`;

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-[hsl(var(--text))]">
        {label}
        {hint ? <span className="ml-2 text-xs text-[hsl(var(--muted))]">{hint}</span> : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-2 flex items-center gap-2 text-sm text-red-400">
          <AlertCircle aria-hidden="true" className="size-4" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Builds a readable summary for the WhatsApp handoff. */
function buildWhatsAppSummary(answers: Answers, fullPhone: string): string {
  return [
    'Hello C786 Realty, I would like prices and availability for Trussardi Residences, Mira Verde.',
    '',
    `Property type: ${labelFor(PROPERTY_TYPE_OPTIONS, answers.propertyType)}`,
    `Budget: ${labelFor(BUDGET_OPTIONS, answers.budget)}`,
    `Funding: ${labelFor(FUNDING_OPTIONS, answers.funding)}`,
    `Timeline: ${labelFor(TIMELINE_OPTIONS, answers.timeline)}`,
    `Name: ${answers.fullName.trim()}`,
    `Phone: ${fullPhone}`,
    `Email: ${answers.email.trim()}`,
  ].join('\n');
}

interface OutcomeProps {
  state: SubmitState;
  message: string;
}

/** Post-submission panel. Distinguishes a real delivery from a handoff. */
function Outcome({ state, message }: OutcomeProps) {
  const delivered = state.kind === 'delivered';

  return (
    <div role="status" aria-live="polite" className="py-4 text-center">
      <span
        aria-hidden="true"
        className={`mx-auto grid size-12 place-items-center rounded-full ${
          delivered ? 'bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]' : 'accent-gradient text-[hsl(var(--bg))]'
        }`}
      >
        {delivered ? <Check className="size-6" /> : <ArrowRight className="size-6" />}
      </span>

      <h3 className="mt-5 text-2xl text-[hsl(var(--text))]">
        {delivered ? 'Thank you — your request is with us' : 'One last step'}
      </h3>

      <p className="mx-auto mt-3 max-w-md text-sm text-[hsl(var(--muted))]">
        {delivered
          ? 'A C786 Realty consultant will contact you with current availability, verified pricing and the official project presentation.'
          : 'Online submissions are not connected on this deployment yet, so your answers have not been sent. Tap below to deliver them to us directly on WhatsApp — nothing you entered is lost.'}
      </p>

      <div className="mt-7 flex justify-center">
        <WhatsAppCta event="whatsapp_click" message={message}>
          {delivered ? 'Message us on WhatsApp' : 'Send my answers on WhatsApp'}
        </WhatsAppCta>
      </div>

      {!delivered && !hasLeadEndpoint() ? (
        <p className="mt-5 text-[0.6875rem] text-[hsl(var(--muted))]">
          Developer note: set <code className="text-[hsl(var(--text))]">VITE_LEAD_ENDPOINT</code> to enable direct
          submission.
        </p>
      ) : null}
    </div>
  );
}

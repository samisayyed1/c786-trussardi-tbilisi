/**
 * Verifies the lead form against a real endpoint.
 *
 * Runs three scenarios and asserts the form only ever claims success when the
 * lead genuinely reached the server:
 *   1. endpoint returns 200 → success confirmation shown, lead_form_success fired
 *   2. endpoint returns 500 → error shown, answers preserved, retry works
 *   3. duplicate submit while in flight → only one request leaves the browser
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4179';
const results = [];
const check = (name, passed, detail = '') => results.push({ name, passed, detail });

const browser = await chromium.launch();

async function fillForm(page) {
  await page.evaluate(() => document.getElementById('enquire').scrollIntoView());
  await page.waitForTimeout(700);
  for (const option of [
    'Studio apartment',
    'AED 500,000–700,000',
    'I require a developer payment plan',
    'Within 1–3 months',
  ]) {
    await page.click(`label:has-text("${option}")`);
    await page.waitForTimeout(180);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(380);
  }
  await page.fill('input[autocomplete="name"]', 'Test Investor');
  await page.fill('input[type="tel"]', '501234567');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.check('input[type="checkbox"]');
}

/* ── 1. Successful delivery ── */
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const posted = [];

  await page.route('**/lead-endpoint', async (route) => {
    posted.push(JSON.parse(route.request().postData() ?? '{}'));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });

  await page.addInitScript(() => {
    window.dataLayer = [];
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  await fillForm(page);
  await page.click('button:has-text("Send Me the Project Details")');
  await page.waitForTimeout(1500);

  const text = (await page.textContent('[role="status"]')) ?? '';
  check('200 → success confirmation', /Thank you/i.test(text), text.slice(0, 70));
  check('exactly one POST sent', posted.length === 1, `${posted.length} requests`);
  check(
    'payload carries all seven answers',
    posted[0]?.propertyType === 'Studio apartment' &&
      posted[0]?.budget?.includes('500,000') &&
      posted[0]?.funding?.includes('payment plan') &&
      posted[0]?.timeline === 'Within 1–3 months' &&
      posted[0]?.fullName === 'Test Investor' &&
      posted[0]?.phone === '+971 501234567' &&
      posted[0]?.email === 'test@example.com' &&
      posted[0]?.consent === true,
    JSON.stringify(posted[0] ?? {}).slice(0, 150),
  );

  const events = await page.evaluate(() => (window.dataLayer ?? []).map((e) => e.event));
  check('lead_form_success fired', events.includes('lead_form_success'));
  check('lead_form_error NOT fired', !events.includes('lead_form_error'));

  await context.close();
}

/* ── 2. Server error, then recovery ── */
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  let failNext = true;

  await page.route('**/lead-endpoint', async (route) => {
    if (failNext) {
      failNext = false;
      await route.fulfill({ status: 500, body: 'nope' });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });

  await page.addInitScript(() => {
    window.dataLayer = [];
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  await fillForm(page);
  await page.click('button:has-text("Send Me the Project Details")');
  await page.waitForTimeout(1400);

  const errorVisible = await page.isVisible('text=/could not|responded with/i');
  check('500 → error shown, no false success', errorVisible);

  const stillHasName = await page.inputValue('input[autocomplete="name"]');
  check('answers preserved after error', stillHasName === 'Test Investor', stillHasName);

  const events1 = await page.evaluate(() => (window.dataLayer ?? []).map((e) => e.event));
  check('lead_form_error fired', events1.includes('lead_form_error'));
  check('no false lead_form_success', !events1.includes('lead_form_success'));

  // Retry succeeds.
  await page.click('button:has-text("Send Me the Project Details")');
  await page.waitForTimeout(1500);
  const retryText = (await page.textContent('[role="status"]')) ?? '';
  check('retry after error succeeds', /Thank you/i.test(retryText), retryText.slice(0, 60));

  await context.close();
}

/* ── 3. Duplicate-submission protection ── */
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  let requestCount = 0;

  await page.route('**/lead-endpoint', async (route) => {
    requestCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 1200)); // slow server
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await fillForm(page);

  // Select by type, not text: the label becomes "Sending…" while in flight.
  const submit = page.locator('form button[type="submit"]');
  await submit.click();
  await page.waitForTimeout(150);
  const disabledDuringFlight = await submit.isDisabled();
  const labelDuringFlight = (await submit.textContent())?.trim();
  check('submit disabled while in flight', disabledDuringFlight, labelDuringFlight);
  check('loading state shown', /Sending/i.test(labelDuringFlight ?? ''), labelDuringFlight);

  // Hammer it; the guard must hold.
  for (let i = 0; i < 4; i += 1) await submit.click({ force: true }).catch(() => {});
  await page.waitForTimeout(2200);
  check('only one request despite repeat clicks', requestCount === 1, `${requestCount} requests`);

  await context.close();
}

await browser.close();

console.log('\n──────── LEAD FORM RESULTS ────────');
let failures = 0;
for (const { name, passed, detail } of results) {
  if (!passed) failures += 1;
  console.log(`${passed ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}
console.log(`\n${results.length - failures}/${results.length} passed`);
process.exitCode = failures > 0 ? 1 : 0;

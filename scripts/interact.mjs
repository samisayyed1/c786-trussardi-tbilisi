/**
 * End-to-end interaction test.
 *
 * Exercises navigation, anchors, the mobile menu, the gallery lightbox (mouse,
 * keyboard and swipe), floor plans, the FAQ accordion, the click-to-load map,
 * and the full seven-question lead form including validation, duplicate-submit
 * protection and the honest no-endpoint outcome.
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4178';
const results = [];
const check = (name, passed, detail = '') =>
  results.push({ name, passed, detail: passed ? detail : `FAIL ${detail}` });

const browser = await chromium.launch();

/* ─────────────── Desktop pass ─────────────── */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleIssues = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleIssues.push(m.text());
  });
  page.on('pageerror', (e) => consoleIssues.push(`pageerror: ${e.message}`));

  const events = [];
  await page.addInitScript(() => {
    window.dataLayer = [];
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Anchor navigation.
  await page.click('nav a[href="#residences"]');
  await page.waitForTimeout(1200);
  const atResidences = await page.evaluate(() => {
    const rect = document.getElementById('residences').getBoundingClientRect();
    return Math.abs(rect.top) < 140;
  });
  check('anchor scroll to #residences', atResidences);

  // Active-section highlighting.
  const activeLink = await page.evaluate(
    () => document.querySelector('nav a[aria-current="true"]')?.getAttribute('href') ?? null,
  );
  check('active nav highlight', activeLink === '#residences', `got ${activeLink}`);

  // Residence details disclosure + floor-plan lightbox.
  await page.click('button:has-text("View details") >> nth=0');
  await page.waitForTimeout(400);
  const detailsOpen = await page.evaluate(
    () => document.querySelector('[id^="residence-details-"]')?.hidden === false,
  );
  check('residence details expand', detailsOpen);

  await page.click('button:has-text("View floor plan") >> nth=0');
  await page.waitForTimeout(600);
  check('floor plan lightbox opens', await page.isVisible('[role="dialog"]'));
  const planCaption = await page.textContent('[role="dialog"] p:last-of-type');
  check('floor plan caption', /floor plan/i.test(planCaption ?? ''), planCaption ?? '');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  check('lightbox closes on Escape', !(await page.isVisible('[role="dialog"]')));

  // Gallery lightbox: open, arrow-key navigation, close button.
  await page.click('a[href="#location"]');
  await page.waitForTimeout(900);
  await page.evaluate(() => document.getElementById('amenities').scrollIntoView());
  await page.waitForTimeout(800);
  const galleryButton = page.locator('button.cursor-zoom-in').first();
  await galleryButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await galleryButton.click();
  await page.waitForTimeout(700);
  check('gallery lightbox opens', await page.isVisible('[role="dialog"]'));

  const firstCaption = await page.textContent('[role="dialog"] [id]:last-of-type');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  const secondCaption = await page.textContent('[role="dialog"] [id]:last-of-type');
  check('gallery arrow-key navigation', firstCaption !== secondCaption, `${firstCaption} → ${secondCaption}`);

  // Focus must be trapped inside the dialog.
  await page.keyboard.press('Tab');
  const focusInside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
  check('lightbox focus trap', focusInside);

  await page.click('[role="dialog"] button[aria-label="Close"]');
  await page.waitForTimeout(500);
  check('lightbox closes via button', !(await page.isVisible('[role="dialog"]')));

  // FAQ accordion.
  const faqButton = page.locator('button[id^="faq-button-"]').nth(1);
  await faqButton.scrollIntoViewIfNeeded();
  await faqButton.click();
  await page.waitForTimeout(400);
  check('faq opens', (await faqButton.getAttribute('aria-expanded')) === 'true');
  await faqButton.click();
  await page.waitForTimeout(300);
  check('faq closes', (await faqButton.getAttribute('aria-expanded')) === 'false');

  // Map must not load until asked.
  const mapBefore = await page.locator('iframe').count();
  check('map not loaded before consent', mapBefore === 0, `${mapBefore} iframes`);
  await page.click('button:has-text("Load interactive map")');
  await page.waitForTimeout(1200);
  check('map loads on click', (await page.locator('iframe').count()) === 1);

  /* ── Lead form ── */
  await page.evaluate(() => document.getElementById('enquire').scrollIntoView());
  await page.waitForTimeout(900);

  // Validation: cannot advance without an answer.
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(400);
  check('step 1 blocks empty submit', await page.isVisible('text=Please choose an option to continue.'));

  const stepLabels = [];
  for (const option of [
    'Studio apartment',
    'AED 500,000–700,000',
    'I require a developer payment plan',
    'Within 1–3 months',
  ]) {
    await page.click(`label:has-text("${option}")`);
    await page.waitForTimeout(250);
    stepLabels.push(await page.textContent('[aria-live="polite"]'));
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(450);
  }
  check('four choice steps advance', stepLabels.length === 4, stepLabels.join(' | '));

  // Back preserves the previous answer.
  await page.click('button:has-text("Back")');
  await page.waitForTimeout(450);
  const preserved = await page.isChecked('input[type="radio"][value="3-6-months"]').catch(() => false);
  const timelineChecked = await page.evaluate(
    () => document.querySelector('input[value="1-3-months"]')?.checked ?? false,
  );
  check('answers preserved on back', timelineChecked, `preserved=${preserved}`);
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(450);

  // Contact step validation.
  await page.click('button:has-text("Send Me the Project Details")');
  await page.waitForTimeout(400);
  const errorCount = await page.locator('[role="alert"]').count();
  check('contact step validation fires', errorCount >= 3, `${errorCount} errors`);

  await page.fill('input[autocomplete="name"]', 'Test Investor');
  await page.fill('input[type="tel"]', '501234567');
  await page.fill('input[type="email"]', 'test@example.com');

  // Invalid email is rejected.
  await page.fill('input[type="email"]', 'not-an-email');
  await page.click('button:has-text("Send Me the Project Details")');
  await page.waitForTimeout(400);
  check('invalid email rejected', await page.isVisible('text=Please enter a valid email address.'));

  await page.fill('input[type="email"]', 'test@example.com');
  await page.check('input[type="checkbox"]');
  await page.click('button:has-text("Send Me the Project Details")');
  await page.waitForTimeout(1400);

  // With no endpoint configured the form must NOT claim delivery.
  const outcomeText = (await page.textContent('[role="status"]')) ?? '';
  check(
    'no-endpoint outcome is honest',
    /have not been sent/i.test(outcomeText) && !/Thank you/i.test(outcomeText),
    outcomeText.slice(0, 90),
  );

  const tracked = await page.evaluate(() => (window.dataLayer ?? []).map((e) => e.event));
  events.push(...tracked);
  check('lead_form_start tracked', tracked.includes('lead_form_start'));
  check('lead_form_step_complete tracked', tracked.includes('lead_form_step_complete'));
  check('lead_form_submit tracked', tracked.includes('lead_form_submit'));
  check('gallery_open tracked', tracked.includes('gallery_open'));

  check('no console errors', consoleIssues.length === 0, consoleIssues.slice(0, 3).join(' | '));
  await context.close();
}

/* ─────────────── Mobile pass ─────────────── */
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Mobile menu.
  await page.click('button[aria-label="Open menu"]');
  await page.waitForTimeout(500);
  check('mobile menu opens', await page.isVisible('#mobile-nav-panel'));
  const bodyLocked = await page.evaluate(() => document.body.style.overflow === 'hidden');
  check('body scroll locked with menu open', bodyLocked);
  await page.click('#mobile-nav-panel a[href="#amenities"]');
  await page.waitForTimeout(1200);
  check('mobile menu closes on selection', !(await page.isVisible('#mobile-nav-panel')));
  const unlocked = await page.evaluate(() => document.body.style.overflow !== 'hidden');
  check('body scroll restored', unlocked);

  // Sticky CTA bar appears past the hero and stays clear of content.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  const barHiddenAtTop = await page.evaluate(() => {
    const bar = document.querySelector('[inert]');
    return bar !== null;
  });
  check('mobile CTA bar hidden over hero', barHiddenAtTop);

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await page.waitForTimeout(900);
  const barVisible = await page.evaluate(() => {
    const bar = [...document.querySelectorAll('div')].find((d) =>
      d.className.includes('fixed inset-x-0 bottom-0'),
    );
    if (!bar) return false;
    return bar.getBoundingClientRect().bottom <= window.innerHeight + 1 && !bar.hasAttribute('inert');
  });
  check('mobile CTA bar shows after hero', barVisible);

  // Gallery swipe.
  await page.evaluate(() => {
    const section = [...document.querySelectorAll('section')].find((s) =>
      s.textContent?.includes('Inside'),
    );
    section?.scrollIntoView();
  });
  await page.waitForTimeout(900);
  const tile = page.locator('button.cursor-zoom-in').first();
  await tile.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await tile.click();
  await page.waitForTimeout(700);
  check('mobile lightbox opens', await page.isVisible('[role="dialog"]'));

  const before = await page.textContent('[role="dialog"] p:last-of-type');
  const box = await page.locator('[role="dialog"]').boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const make = (type, x) =>
      new TouchEvent(type, {
        bubbles: true,
        changedTouches: [new Touch({ identifier: 1, target: dialog, clientX: x, clientY: 400 })],
        touches: type === 'touchend' ? [] : [new Touch({ identifier: 1, target: dialog, clientX: x, clientY: 400 })],
      });
    dialog.dispatchEvent(make('touchstart', 300));
    dialog.dispatchEvent(make('touchend', 120));
  });
  await page.waitForTimeout(600);
  const after = await page.textContent('[role="dialog"] p:last-of-type');
  check('gallery swipe advances', before !== after, `${before} → ${after}`);

  await context.close();
}

await browser.close();

console.log('\n──────── INTERACTION RESULTS ────────');
let failures = 0;
for (const { name, passed, detail } of results) {
  if (!passed) failures += 1;
  console.log(`${passed ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}
console.log(`\n${results.length - failures}/${results.length} passed`);
process.exitCode = failures > 0 ? 1 : 0;

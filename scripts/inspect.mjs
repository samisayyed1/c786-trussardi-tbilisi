/**
 * Visual + interaction inspection harness.
 *
 * Drives the built site across every target viewport, captures screenshots,
 * and asserts the things that actually break landing pages: horizontal
 * overflow, undersized touch targets, broken images, and console errors.
 *
 * Usage: node scripts/inspect.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://localhost:4178';
const OUT = '/tmp/shots';

const VIEWPORTS = [
  { name: '320', width: 320, height: 720, mobile: true },
  { name: '360', width: 360, height: 800, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '430', width: 430, height: 932, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: false },
  { name: '1024', width: 1024, height: 800, mobile: false },
  { name: '1440', width: 1440, height: 900, mobile: false },
  { name: '1920', width: 1920, height: 1080, mobile: false },
];

const problems = [];
const note = (viewport, message) => problems.push(`[${viewport}] ${message}`);

async function audit(page, viewport) {
  // Horizontal overflow — the single most common mobile defect.
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    if (doc.scrollWidth <= doc.clientWidth + 1) return null;
    const offenders = [];
    for (const element of document.querySelectorAll('*')) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0) continue;
      if (rect.right > doc.clientWidth + 1 || rect.left < -1) {
        offenders.push(
          `${element.tagName.toLowerCase()}.${String(element.className).slice(0, 60)} → ${Math.round(rect.left)}..${Math.round(rect.right)}`,
        );
      }
      if (offenders.length >= 6) break;
    }
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders };
  });

  if (overflow) {
    note(viewport.name, `horizontal overflow ${overflow.scrollWidth} > ${overflow.clientWidth}`);
    for (const offender of overflow.offenders) note(viewport.name, `  ↳ ${offender}`);
  }

  // Broken or zero-size images.
  const brokenImages = await page.evaluate(() =>
    [...document.querySelectorAll('img')]
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src)
      .slice(0, 8),
  );
  for (const src of brokenImages) note(viewport.name, `broken image: ${src}`);

  // Images without meaningful alt text.
  const missingAlt = await page.evaluate(
    () => [...document.querySelectorAll('img')].filter((img) => !img.alt || img.alt.trim().length < 5).length,
  );
  if (missingAlt > 0) note(viewport.name, `${missingAlt} image(s) with missing/short alt text`);

  // Touch targets below 44px on mobile widths.
  if (viewport.mobile) {
    const small = await page.evaluate(() => {
      const results = [];
      for (const element of document.querySelectorAll('a[href], button, select, input[type="checkbox"]')) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue; // hidden
        if (element.closest('[inert]') || element.closest('[hidden]')) continue;
        // Screen-reader-only controls are 1px by design and expand on focus.
        if (rect.width <= 2 && rect.height <= 2) continue;
        if (rect.height < 44 - 0.5) {
          results.push(`${element.tagName.toLowerCase()} "${(element.textContent ?? '').trim().slice(0, 28)}" h=${rect.height.toFixed(1)}`);
        }
        if (results.length >= 8) break;
      }
      return results;
    });
    for (const entry of small) note(viewport.name, `touch target < 44px: ${entry}`);
  }

  // Heading hierarchy.
  const headings = await page.evaluate(() => {
    const levels = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => Number(h.tagName[1]));
    const h1Count = levels.filter((level) => level === 1).length;
    let jumps = 0;
    for (let i = 1; i < levels.length; i += 1) if (levels[i] - levels[i - 1] > 1) jumps += 1;
    return { h1Count, jumps };
  });
  if (headings.h1Count !== 1) note(viewport.name, `expected exactly one <h1>, found ${headings.h1Count}`);
  if (headings.jumps > 0) note(viewport.name, `${headings.jumps} heading-level jump(s)`);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
    });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') consoleErrors.push(`${message.type()}: ${message.text()}`);
    });
    page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) => {
      // Font CDN may be unreachable in a sandbox; that is not a site defect.
      if (!request.url().includes('fonts.g')) consoleErrors.push(`requestfailed: ${request.url()}`);
    });

    await page.goto(BASE, { waitUntil: 'networkidle' });
    // Let the intro overlay finish.
    await page.waitForTimeout(2600);

    // Scroll the whole page so lazy media and reveals resolve.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 400));
    });
    await page.waitForTimeout(700);

    await audit(page, viewport);
    for (const error of consoleErrors.slice(0, 6)) note(viewport.name, `console → ${error}`);

    await page.screenshot({ path: `${OUT}/${viewport.name}-top.jpg`, quality: 72, type: 'jpeg' });
    await page.screenshot({ path: `${OUT}/${viewport.name}-full.jpg`, quality: 62, type: 'jpeg', fullPage: true });

    await context.close();
    console.log(`captured ${viewport.name}`);
  }

  await browser.close();

  console.log('\n──────── AUDIT ────────');
  if (problems.length === 0) console.log('No issues found.');
  else for (const problem of problems) console.log(problem);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

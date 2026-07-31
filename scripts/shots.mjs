/**
 * Captures viewport-sized screenshots while scrolling, which reflects what a
 * visitor actually sees (full-page captures do not resolve scroll-triggered
 * reveals correctly).
 *
 * Usage: node scripts/shots.mjs <width> <height> <label> [baseUrl]
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const [, , widthArg, heightArg, label, baseArg] = process.argv;
const width = Number(widthArg ?? 390);
const height = Number(heightArg ?? 844);
const base = baseArg ?? 'http://localhost:4178';
const out = `/tmp/shots/${label ?? width}`;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  isMobile: width < 768,
  hasTouch: width < 768,
});
const page = await context.newPage();

await fs.mkdir(out, { recursive: true });
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(3200);

const total = await page.evaluate(() => document.body.scrollHeight);
const step = Math.round(height * 0.9);
let index = 0;

for (let y = 0; y < total; y += step) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  // Let reveals, lazy images and scrubbed triggers settle at this position.
  await page.waitForTimeout(650);
  await page.screenshot({ path: `${out}/${String(index).padStart(2, '0')}.jpg`, quality: 76, type: 'jpeg' });
  index += 1;
}

console.log(`${label}: ${index} frames, page height ${total}px`);
await browser.close();

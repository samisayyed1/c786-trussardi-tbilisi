/**
 * Verifies real, composited text contrast in the hero.
 *
 * The hero is the one place where text sits over photography rather than a flat
 * surface, so its contrast cannot be reasoned about from the palette alone — it
 * depends on the render, the scrim and the element's own alpha, all multiplied
 * together. This screenshots the page with the text hidden, samples the actual
 * pixels behind each element, composites the text colour over them, and reports
 * the WCAG ratio that a visitor genuinely gets.
 *
 * Usage: node scripts/verify-contrast.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';

const BASE = process.argv[2] ?? 'http://localhost:4178';

const toLinear = (channel) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (r, g, b) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

const contrastRatio = (a, b) => {
  const [lighter, darker] = [luminance(...a), luminance(...b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

const TARGETS = [
  ['eyebrow', '[data-hero="eyebrow"]'],
  ['headline', 'h1'],
  ['copy', '[data-hero="copy"]'],
  ['fact-label', '[data-hero="fact"] dt'],
  ['fact-value', '[data-hero="fact"] dd'],
];

const VIEWPORTS = [
  [1440, 900, 'desktop'],
  [390, 844, 'mobile'],
];

const browser = await chromium.launch();
const failures = [];

for (const [width, height, label] of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // Let the intro finish and the hero timeline settle at its final values.
  await page.waitForTimeout(4000);

  const measured = await page.evaluate((targets) => {
    // Resolve whatever colour syntax the engine reports — Tailwind's opacity
    // modifiers compute to oklab(), and modern CSS may yield color(srgb ...) or
    // color-mix(). Painting onto a canvas and reading the pixel back normalises
    // all of them to straight RGBA; parsing the string by hand does not.
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    const toRgba = (value) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return { rgb: [r, g, b], alpha: a / 255 };
    };

    const out = [];
    for (const [name, selector] of targets) {
      const element = document.querySelector(selector);
      if (!element) continue;
      const rect = element.getBoundingClientRect();
      // Skip anything not actually painted at this breakpoint — a display:none
      // element still reports a colour, which would produce a meaningless ratio.
      if (rect.width < 1 || rect.height < 1) continue;
      const styles = getComputedStyle(element);
      const { rgb, alpha } = toRgba(styles.color);
      out.push({
        name,
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
        rgb,
        alpha,
        size: Number.parseFloat(styles.fontSize),
        weight: styles.fontWeight,
      });
    }
    return out;
  }, TARGETS);

  // Hide the text so the screenshot captures only what sits behind it.
  await page.evaluate(() => {
    const shell = document.querySelector('.shell');
    if (shell instanceof HTMLElement) shell.style.visibility = 'hidden';
  });
  await page.waitForTimeout(300);
  const screenshot = await page.screenshot({ type: 'png' });

  for (const target of measured) {
    const region = {
      left: Math.max(0, target.x),
      top: Math.max(0, target.y),
      width: Math.max(1, Math.min(target.w, width - target.x)),
      height: Math.max(1, Math.min(target.h, height - target.y)),
    };
    // Mean background is not the honest test for text over photography. A single
    // bright window behind one letter fails while the average looks fine, so the
    // worst realistic case is measured too: the 95th-percentile brightest pixel
    // in the region for light text, the 5th-percentile darkest for dark text.
    const { data, info } = await sharp(screenshot)
      .extract(region)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = [];
    for (let i = 0; i < data.length; i += info.channels) {
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }

    const mean = [0, 1, 2].map((c) => pixels.reduce((sum, px) => sum + px[c], 0) / pixels.length);
    const textIsLight = luminance(...target.rgb) > 0.5;

    const sorted = [...pixels].sort((a, b) => luminance(...a) - luminance(...b));
    const index = textIsLight
      ? Math.floor(sorted.length * 0.95) // brightest realistic background
      : Math.floor(sorted.length * 0.05); // darkest realistic background
    const worst = sorted[Math.min(index, sorted.length - 1)];

    const composite = (background) =>
      target.rgb.map((channel, i) => channel * target.alpha + background[i] * (1 - target.alpha));

    const meanRatio = contrastRatio(composite(mean), mean);
    const worstRatio = contrastRatio(composite(worst), worst);

    const isLarge = target.size >= 24 || (target.size >= 18.66 && Number(target.weight) >= 700);
    const required = isLarge ? 3 : 4.5;
    const passed = worstRatio >= required;
    if (!passed) failures.push(`${label}/${target.name}`);

    console.log(
      `${label.padEnd(8)} ${target.name.padEnd(12)} ${String(Math.round(target.size)).padStart(3)}px  ` +
        `avg ${meanRatio.toFixed(1)}:1  worst ${worstRatio.toFixed(2)}:1  needs ${required}  ${
          passed ? '✓' : '✗ FAIL'
        }`,
    );
  }

  await context.close();
}

await browser.close();

console.log(failures.length === 0 ? '\nAll hero text meets WCAG AA.' : `\n${failures.length} failing: ${failures.join(', ')}`);
process.exitCode = failures.length > 0 ? 1 : 0;

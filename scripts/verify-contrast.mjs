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
  ['reassurance', '[data-hero="cta"] + p'],
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
    const { channels } = await sharp(screenshot).extract(region).stats();
    const background = channels.slice(0, 3).map((channel) => channel.mean);

    // Composite the (possibly translucent) text colour over what's behind it.
    const foreground = target.rgb.map(
      (channel, index) => channel * target.alpha + background[index] * (1 - target.alpha),
    );

    const isLarge = target.size >= 24 || (target.size >= 18.66 && Number(target.weight) >= 700);
    const required = isLarge ? 3 : 4.5;
    const ratio = contrastRatio(foreground, background);
    const passed = ratio >= required;
    if (!passed) failures.push(`${label}/${target.name}`);

    console.log(
      `${label.padEnd(8)} ${target.name.padEnd(12)} ${String(Math.round(target.size)).padStart(3)}px  ` +
        `${ratio.toFixed(2)}:1  needs ${required}  ${passed ? '✓' : '✗ FAIL'}`,
    );
  }

  await context.close();
}

await browser.close();

console.log(failures.length === 0 ? '\nAll hero text meets WCAG AA.' : `\n${failures.length} failing: ${failures.join(', ')}`);
process.exitCode = failures.length > 0 ? 1 : 0;

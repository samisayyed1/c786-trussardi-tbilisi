/**
 * Builds responsive AVIF + WebP derivatives from `media-src/` into `public/media/`,
 * and emits a typed manifest at `src/content/media-manifest.ts`.
 *
 * Run with: pnpm media
 *
 * The manifest carries intrinsic width/height for every asset so the UI can reserve
 * exact space and avoid cumulative layout shift.
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { MEDIA, WIDTHS, PLAN_WIDTHS, qualityFor } from './media.config.mjs';

const SRC_DIR = 'media-src';
const OUT_DIR = path.join('public', 'media');
const MANIFEST = path.join('src', 'content', 'media-manifest.ts');

/** Re-encode everything, ignoring the up-to-date check. */
const FORCE = process.argv.includes('--force');

/** A low-quality blurred base64 preview, inlined to cover the decode gap. */
async function makeLqip(input) {
  const buf = await sharp(input).resize(20, null, { fit: 'inside' }).blur(1.4).webp({ quality: 32 }).toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

/**
 * Records which source file each id was built from, so the incremental check is
 * correct even when an id is repointed at a different image.
 *
 * A plain mtime comparison is NOT enough here: changing `file` in media.config
 * swaps the source without touching any timestamp, so stale derivatives would
 * be silently kept. Comparing the recorded source path *and* its mtime catches
 * both a repointed id and an edited image.
 */
// Kept out of public/ so it is never served as a static asset. Gitignored:
// it is a local build cache, and a missing file just means a full rebuild.
const STATE_FILE = '.media-build-state.json';

async function readState() {
  if (FORCE) return {};
  try {
    return JSON.parse(await fs.readFile(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

/** True when every derivative for this id is present and built from this exact source. */
async function isUpToDate(state, item, sourceMtimeMs, expectedFiles, mobileFile, mobileMtimeMs) {
  const previous = state[item.id];
  if (!previous) return false;
  if (previous.file !== item.file) return false;
  if (previous.mtimeMs !== sourceMtimeMs) return false;
  if ((previous.mobileFile ?? null) !== (mobileFile ?? null)) return false;
  if ((previous.mobileMtimeMs ?? null) !== (mobileMtimeMs ?? null)) return false;

  const present = await Promise.all(
    expectedFiles.map((name) =>
      fs
        .stat(path.join(OUT_DIR, name))
        .then(() => true)
        .catch(() => false),
    ),
  );
  return present.every(Boolean);
}

/** Height for a given width under a [w, h] aspect ratio. */
function cropHeight(width, [aw, ah]) {
  return Math.round((width * ah) / aw);
}

/** Width tiers for a source, always including its native width. */
function widthsFor(kind, sourceWidth) {
  const tiers = kind === 'plan' ? PLAN_WIDTHS : WIDTHS;
  const widths = tiers.filter((w) => w <= sourceWidth);
  // Always offer the source's native width, so retina screens get every
  // pixel the developer actually published rather than a downscaled tier.
  if (!widths.includes(sourceWidth)) widths.push(sourceWidth);
  return widths.sort((a, b) => a - b);
}

/** Filenames a given prefix is expected to produce. */
function expectedNames(prefix, kind, sourceWidth) {
  return widthsFor(kind, sourceWidth).flatMap((w) => [`${prefix}-${w}.avif`, `${prefix}-${w}.webp`]);
}

/**
 * Encodes one source into every applicable width tier and returns its variant
 * list. `prefix` distinguishes the art-directed mobile set from the main one.
 */
async function encodeVariants(input, meta, kind, prefix, skip, cropAspect) {
  // A crop changes the effective source width: a 2:3 portrait taken from a
  // landscape render can only be as wide as its height allows.
  const effectiveWidth = cropAspect
    ? Math.min(meta.width, Math.round(meta.height * (cropAspect[0] / cropAspect[1])))
    : meta.width;
  const widths = widthsFor(kind, effectiveWidth);
  const variants = [];
  let encoded = 0;

  for (const width of widths) {
    const height = cropAspect ? cropHeight(width, cropAspect) : Math.round((meta.height / meta.width) * width);
    for (const format of /** @type {const} */ (['avif', 'webp'])) {
      const name = `${prefix}-${width}.${format}`;

      if (!skip) {
        const pipeline = cropAspect
          ? sharp(input, { failOn: 'none' }).resize(width, cropHeight(width, cropAspect), {
              fit: 'cover',
              position: 'centre',
              withoutEnlargement: true,
            })
          : sharp(input, { failOn: 'none' }).resize(width, null, { withoutEnlargement: true });
        // Quality varies by tier and by kind — plans are line art and need
        // their labels to stay legible; see qualityFor in media.config.
        const quality = qualityFor(width, kind);
        await (format === 'avif'
          ? pipeline.avif({ quality: quality.avif, effort: 5 })
          : pipeline.webp({ quality: quality.webp })
        ).toFile(path.join(OUT_DIR, name));
        encoded += 1;
      }

      variants.push({ format, width, height, src: `/media/${name}` });
    }
  }

  return { variants, encoded };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const entries = [];
  const previousState = await readState();
  const nextState = {};

  for (const item of MEDIA) {
    const input = path.join(SRC_DIR, item.file);
    const image = sharp(input, { failOn: 'none' });
    const meta = await image.metadata();
    if (!meta.width || !meta.height) throw new Error(`Unreadable dimensions for ${item.file}`);

    const { mtimeMs } = await fs.stat(input);

    // Optional art-directed portrait for phones: either a separate render
    // (mobileFile) or a centre crop of this same source (mobileCrop).
    const mobileInput = item.mobileFile ? path.join(SRC_DIR, item.mobileFile) : item.mobileCrop ? input : null;
    const mobileMeta = mobileInput
      ? item.mobileFile
        ? await sharp(mobileInput).metadata()
        : meta
      : null;
    const mobileMtimeMs = item.mobileFile ? (await fs.stat(mobileInput)).mtimeMs : null;
    const crop = item.mobileFile ? undefined : item.mobileCrop;

    const mobileEffectiveWidth =
      mobileMeta && crop
        ? Math.min(mobileMeta.width, Math.round(mobileMeta.height * (crop[0] / crop[1])))
        : mobileMeta?.width;

    const expectedFiles = expectedNames(item.id, item.kind, meta.width);
    if (mobileMeta) expectedFiles.push(...expectedNames(`${item.id}-m`, item.kind, mobileEffectiveWidth));

    const skip = await isUpToDate(
      previousState,
      item,
      mtimeMs,
      expectedFiles,
      item.mobileFile ?? (item.mobileCrop ? `crop:${item.mobileCrop.join('x')}` : null),
      mobileMtimeMs,
    );

    const main = await encodeVariants(input, meta, item.kind, item.id, skip);
    const mobile = mobileMeta
      ? await encodeVariants(mobileInput, mobileMeta, item.kind, `${item.id}-m`, skip, crop)
      : null;

    nextState[item.id] = {
      file: item.file,
      mtimeMs,
      mobileFile: item.mobileFile ?? (item.mobileCrop ? `crop:${item.mobileCrop.join('x')}` : null),
      mobileMtimeMs,
    };

    entries.push({
      id: item.id,
      kind: item.kind,
      alt: item.alt,
      caption: item.caption,
      source: item.source,
      priority: Boolean(item.priority),
      gallery: Boolean(item.gallery),
      heroOrder: item.heroOrder ?? null,
      width: meta.width,
      height: meta.height,
      lqip: await makeLqip(input),
      variants: main.variants,
      ...(mobile
        ? {
            mobile: {
              alt: item.mobileAlt ?? item.alt,
              width: mobile.variants[mobile.variants.length - 1].width,
              height: mobile.variants[mobile.variants.length - 1].height,
              variants: mobile.variants,
            },
          }
        : {}),
    });

    const encoded = main.encoded + (mobile?.encoded ?? 0);
    const total = main.variants.length + (mobile?.variants.length ?? 0);
    process.stdout.write(
      `  ✓ ${item.id} (${meta.width}×${meta.height}${mobileMeta ? ' + portrait' : ''}) — ${
        encoded === 0 ? 'up to date' : `encoded ${encoded}/${total}`
      }\n`,
    );
  }

  const byId = Object.fromEntries(entries.map((entry) => [entry.id, entry]));
  const ids = entries.map((entry) => entry.id);

  const file = `// AUTO-GENERATED by scripts/optimize-media.mjs — do not edit by hand.
// Regenerate with: pnpm media

export type MediaKind = 'exterior' | 'interior' | 'amenity' | 'location' | 'plan' | 'masterplan';

export interface MediaVariant {
  readonly format: 'avif' | 'webp';
  readonly width: number;
  readonly height: number;
  readonly src: string;
}

export interface MediaAsset {
  readonly id: MediaId;
  readonly kind: MediaKind;
  /** Meaningful alternative text, written per asset. */
  readonly alt: string;
  /** Human caption shown in the gallery lightbox. */
  readonly caption: string;
  /** Provenance of the original file, for audit and rights tracking. */
  readonly source: string;
  /** Eagerly loaded and preloaded when true. */
  readonly priority: boolean;
  /** Included in the cinematic project gallery when true. */
  readonly gallery: boolean;
  /** Position in the hero slideshow, or null if not a hero slide. */
  readonly heroOrder: number | null;
  /**
   * Art-directed portrait source for phones. Present only where the landscape
   * original composes badly in a tall viewport.
   */
  readonly mobile?: {
    readonly alt: string;
    readonly width: number;
    readonly height: number;
    readonly variants: readonly MediaVariant[];
  };
  readonly width: number;
  readonly height: number;
  /** Inlined blurred preview used to avoid a flash of empty space. */
  readonly lqip: string;
  readonly variants: readonly MediaVariant[];
}

export type MediaId = ${ids.map((id) => `'${id}'`).join(' | ')};

export const MEDIA: Readonly<Record<MediaId, MediaAsset>> = ${JSON.stringify(byId, null, 2)} as const;

/** Hero slideshow, in declared order. The first entry is the LCP image. */
export const HERO_MEDIA: readonly MediaAsset[] = [
${entries
  .filter((entry) => entry.heroOrder !== null)
  .sort((a, b) => a.heroOrder - b.heroOrder)
  .map((entry) => `  MEDIA['${entry.id}'],`)
  .join('\n')}
];

export const GALLERY_MEDIA: readonly MediaAsset[] = [
${entries
  .filter((entry) => entry.gallery)
  .map((entry) => `  MEDIA['${entry.id}'],`)
  .join('\n')}
];
`;

  await fs.writeFile(MANIFEST, file, 'utf8');

  // Remove derivatives from previous runs that nothing references any more.
  // Changing the width tiers or repointing an id otherwise leaves orphans
  // behind, which ship in the build and bloat the deploy.
  const referenced = new Set(
    entries.flatMap((entry) =>
      [...entry.variants, ...(entry.mobile?.variants ?? [])].map((v) => path.basename(v.src)),
    ),
  );
  const onDisk = await fs.readdir(OUT_DIR);
  const orphans = onDisk.filter((name) => /\.(avif|webp)$/.test(name) && !referenced.has(name));
  await Promise.all(orphans.map((name) => fs.unlink(path.join(OUT_DIR, name))));
  if (orphans.length > 0) console.log(`Removed ${orphans.length} orphaned derivative(s).`);

  // Guard the hero preload: it lives in static HTML, so a tier change here can
  // silently point it at a file that no longer exists and quietly wreck LCP.
  try {
    const html = await fs.readFile('index.html', 'utf8');
    const preloaded = [...html.matchAll(/\/media\/([A-Za-z0-9_-]+\.(?:avif|webp))/g)].map((m) => m[1]);
    const missing = preloaded.filter((name) => !referenced.has(name));
    if (missing.length > 0) {
      throw new Error(
        `index.html references media that no longer exists: ${missing.join(', ')}.\n` +
          `Update the hero preload/OG tags to match the current width tiers.`,
      );
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  // Written last: if encoding failed partway, the next run redoes the work
  // rather than trusting a half-finished build.
  await fs.writeFile(STATE_FILE, JSON.stringify(nextState, null, 2), 'utf8');
  console.log(`\nWrote ${MANIFEST} (${entries.length} assets).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

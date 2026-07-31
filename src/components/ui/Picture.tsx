import { useState, type CSSProperties } from 'react';
import type { MediaAsset } from '../../content/media-manifest';
import { asset as resolveAsset } from '../../lib/asset';

interface PictureProps {
  asset: MediaAsset;
  /** The `sizes` attribute. Get this right — it decides what phones download. */
  sizes: string;
  className?: string;
  /** Applied to the <img> itself, e.g. object-cover positioning. */
  imgClassName?: string;
  /** Overrides the asset's own priority flag. */
  priority?: boolean;
  style?: CSSProperties;
}

/**
 * Renders a responsive AVIF → WebP picture with intrinsic dimensions.
 *
 * The intrinsic width/height are always emitted so the browser reserves exact
 * space and the page does not shift as media arrives. A blurred inline preview
 * covers the decode gap and fades out once the full image paints.
 */
export function Picture({ asset, sizes, className = '', imgClassName = '', priority, style }: PictureProps) {
  const [loaded, setLoaded] = useState(false);
  const isPriority = priority ?? asset.priority;

  const srcSet = (format: 'avif' | 'webp'): string =>
    asset.variants
      .filter((variant) => variant.format === format)
      .map((variant) => `${resolveAsset(variant.src)} ${variant.width}w`)
      .join(', ');

  // The largest WebP is the safest <img> fallback for any browser that
  // understands neither srcset nor AVIF.
  const fallback = asset.variants.filter((variant) => variant.format === 'webp').at(-1);

  return (
    <div
      className={`relative overflow-hidden bg-[hsl(var(--surface))] ${className}`}
      style={{
        // Painted behind the image so there is never a bare dark rectangle.
        backgroundImage: loaded ? undefined : `url(${asset.lqip})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
      }}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
        <img
          src={fallback ? resolveAsset(fallback.src) : undefined}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          loading={isPriority ? 'eager' : 'lazy'}
          decoding={isPriority ? 'sync' : 'async'}
          fetchPriority={isPriority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          className={`h-full w-full transition-opacity duration-700 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      </picture>
    </div>
  );
}

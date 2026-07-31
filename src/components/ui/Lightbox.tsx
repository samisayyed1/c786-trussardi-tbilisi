import { useCallback, useEffect, useId, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { MediaAsset, MediaKind } from '../../content/media-manifest';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { Picture } from './Picture';

const KIND_LABEL: Record<MediaKind, string> = {
  exterior: 'Exterior render',
  interior: 'Interior render',
  amenity: 'Amenity render',
  location: 'Location photograph',
  plan: 'Floor plan',
  masterplan: 'Masterplan',
};

interface LightboxProps {
  items: readonly MediaAsset[];
  /** Index to open at, or null when closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

/** Minimum horizontal travel before a touch gesture counts as a swipe. */
const SWIPE_THRESHOLD = 48;

/**
 * Fullscreen media viewer with previous / next / close, keyboard control,
 * touch swiping and a focus trap.
 */
export function Lightbox({ items, index, onClose, onIndexChange }: LightboxProps) {
  const open = index !== null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [titleId, descId] = [useId(), useId()];

  useLockBodyScroll(open);

  const goTo = useCallback(
    (next: number) => {
      if (items.length === 0) return;
      onIndexChange((next + items.length) % items.length);
    },
    [items.length, onIndexChange],
  );

  // Remember what had focus, move focus in, and restore it on close.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previouslyFocused.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowRight' && items.length > 1) {
        event.preventDefault();
        goTo((index ?? 0) + 1);
        return;
      }
      if (event.key === 'ArrowLeft' && items.length > 1) {
        event.preventDefault();
        goTo((index ?? 0) - 1);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, index, items.length, goTo, onClose]);

  if (!open || index === null) return null;

  const asset = items[index];
  if (!asset) return null;

  const multiple = items.length > 1;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-[90] flex flex-col bg-black/96 backdrop-blur-sm"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (start === null || !multiple) return;
        const delta = (event.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        goTo(index + (delta < 0 ? 1 : -1));
      }}
    >
      <div className="flex items-center justify-between gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 md:px-8">
        <p id={titleId} className="text-xs tracking-[0.16em] text-[hsl(var(--muted))] uppercase">
          {KIND_LABEL[asset.kind]}
          {multiple ? (
            <span className="ml-3 font-mono tabular-nums">
              {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
          ) : null}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-[hsl(var(--stroke))] text-[hsl(var(--text))] transition-colors hover:border-[hsl(var(--accent-start))]"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-4 md:px-8">
        <Picture
          key={asset.id}
          asset={asset}
          priority
          sizes="100vw"
          className="max-h-full w-auto max-w-full bg-transparent"
          imgClassName="max-h-[70svh] w-auto object-contain"
          style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
        />
      </div>

      <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8">
        <p id={descId} className="max-w-md text-sm text-[hsl(var(--muted))]">
          {asset.caption}
        </p>

        {multiple ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous image"
              className="grid size-11 place-items-center rounded-full border border-[hsl(var(--stroke))] text-[hsl(var(--text))] transition-colors hover:border-[hsl(var(--accent-start))]"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next image"
              className="grid size-11 place-items-center rounded-full border border-[hsl(var(--stroke))] text-[hsl(var(--text))] transition-colors hover:border-[hsl(var(--accent-start))]"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

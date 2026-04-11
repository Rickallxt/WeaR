import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cx } from '../lib/cx';

export function WindowDots() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,255,255,0.72)]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[rgba(143,150,255,0.52)]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[rgba(197,223,99,0.62)]" />
    </div>
  );
}

export function SectionKicker({ children }: { children: ReactNode }) {
  return <p className="section-kicker">{children}</p>;
}

export function SurfaceBadge({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'accent' | 'accent-soft';
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-3 py-1 text-[0.72rem] uppercase tracking-[0.22em]',
        tone === 'default' && 'border border-[rgba(24,24,29,0.08)] bg-white/78 text-[var(--muted)]',
        tone === 'accent' && 'bg-[rgba(143,150,255,0.14)] text-[var(--text)]',
        tone === 'accent-soft' && 'bg-[rgba(197,223,99,0.16)] text-[var(--text)]',
      )}
    >
      {children}
    </span>
  );
}

export function Panel({
  children,
  className,
  variant = 'soft',
}: {
  children: ReactNode;
  className?: string;
  variant?: 'soft' | 'glass' | 'solid';
}) {
  return (
    <div
      className={cx(
        'rounded-[28px] border',
        variant === 'soft' &&
          'border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.9),rgba(248,243,236,0.84))] shadow-[0_22px_60px_rgba(17,18,23,0.08)] backdrop-blur-2xl',
        variant === 'glass' &&
          'border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(255,255,255,0.56))] shadow-[0_30px_80px_rgba(17,18,23,0.12)] backdrop-blur-3xl',
        variant === 'solid' && 'border-[rgba(24,24,29,0.08)] bg-white shadow-[0_14px_32px_rgba(17,18,23,0.06)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AppGlyph({ name, active = false }: { name: string; active?: boolean }) {
  const stroke = active ? 'rgba(22,22,26,0.96)' : 'rgba(97,100,111,0.9)';

  switch (name) {
    case 'grid':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth="1.8">
          <rect x="4" y="4" width="6" height="6" rx="1.8" />
          <rect x="14" y="4" width="6" height="6" rx="1.8" />
          <rect x="4" y="14" width="6" height="6" rx="1.8" />
          <rect x="14" y="14" width="6" height="6" rx="1.8" />
        </svg>
      );
    case 'hanger':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M10.5 6a1.5 1.5 0 1 1 3 0c0 1.2-.7 1.9-1.9 2.5l7 4.3c1.4.8.8 3-1 3H6.4c-1.8 0-2.4-2.2-1-3l6.9-4.3" />
        </svg>
      );
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        </svg>
      );
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth="1.8">
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19c1.5-3 4-4.5 6.5-4.5S17 16 18.5 19" />
        </svg>
      );
    case 'bookmark':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5V20l-6.5-3-6.5 3V6A1.5 1.5 0 0 1 7 4.5Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M12 3.5v4.2" />
          <path d="M12 16.3v4.2" />
          <path d="M4.8 12h4.2" />
          <path d="M15 12h4.2" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      );
  }
}

export function ItemArtwork({
  palette,
  label,
  compact = false,
  imageUrl,
}: {
  palette: string;
  label: string;
  compact?: boolean;
  imageUrl?: string | null;
}) {
  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-[22px] border border-white/80',
        compact ? 'aspect-[1.1/1]' : 'aspect-[1.02/1.18]',
      )}
    >
      <div className={cx('absolute inset-0 bg-gradient-to-br', palette)} />
      {imageUrl ? (
        <>
          <img src={imageUrl} alt={label} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(22,22,26,0.18))]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_42%)]" />
          <div className="absolute left-[18%] top-[14%] h-[56%] w-[30%] rounded-[999px] bg-white/56" />
          <div className="absolute left-[38%] top-[18%] h-[54%] w-[24%] rounded-[999px] bg-[rgba(22,22,26,0.08)]" />
          <div className="absolute left-[28%] top-[50%] h-[28%] w-[42%] rounded-[26px] bg-[rgba(255,255,255,0.72)]" />
        </>
      )}
      <div className="absolute bottom-3 left-3 rounded-full bg-white/76 px-3 py-2 text-[0.68rem] uppercase tracking-[0.22em] text-[var(--muted)] backdrop-blur-xl">
        {label}
      </div>
    </div>
  );
}

export function WardrobeMosaic({
  items,
  label,
}: {
  items: Array<{
    id: string;
    name: string;
    palette: string;
    imageDataUrl?: string | null;
  }>;
  label: string;
}) {
  const visibleItems = items.slice(0, 4);
  const gridClass =
    visibleItems.length <= 1
      ? 'grid-cols-1'
      : visibleItems.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-2';

  if (visibleItems.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(255,255,255,0.66))] p-4 shadow-[0_18px_42px_rgba(17,18,23,0.08)]">
        <div className="flex aspect-[1.08/1] items-center justify-center rounded-[20px] border border-dashed border-[rgba(24,24,29,0.12)] bg-[rgba(248,244,238,0.8)] px-5 text-center text-sm leading-7 text-[var(--muted)]">
          Upload owned wardrobe pieces to generate a look here.
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-white/82 px-3 py-2 text-[0.68rem] uppercase tracking-[0.22em] text-[var(--muted)] backdrop-blur-xl">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(255,255,255,0.66))] p-3 shadow-[0_18px_42px_rgba(17,18,23,0.08)]">
      <div className={cx('grid gap-3', gridClass)}>
        {visibleItems.map((item) => (
          <ItemArtwork
            key={item.id}
            palette={item.palette}
            imageUrl={item.imageDataUrl}
            label={item.name}
            compact={visibleItems.length !== 1}
          />
        ))}
      </div>
      <div className="absolute bottom-3 right-3 rounded-full bg-white/82 px-3 py-2 text-[0.68rem] uppercase tracking-[0.22em] text-[var(--muted)] backdrop-blur-xl">
        {label}
      </div>
    </div>
  );
}

export function MetricCard({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <Panel className="p-5" variant="solid">
      <p className="font-display text-[2rem] tracking-[-0.06em] text-[var(--text)]">{value}</p>
      <p className="mt-4 text-sm uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--text)]">{detail}</p>
    </Panel>
  );
}

export function MotionCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../lib/cx';

/* ──────────────────────────────────────────────────────────────
   MaterialIcon — renders a Material Symbols Outlined icon
   Uses the variable font loaded in index.html
   ────────────────────────────────────────────────────────────── */
export function MaterialIcon({
  name,
  filled = false,
  size = 24,
  className = '',
  style,
}: {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cx(
        'material-symbols-outlined',
        filled && 'material-symbols-filled',
        className,
      )}
      style={{ fontSize: size, ...style }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   AppGlyph — backwards-compatible icon wrapper
   Maps legacy icon names → Material Symbols names
   ────────────────────────────────────────────────────────────── */
const GLYPH_MAP: Record<string, string> = {
  grid:     'grid_view',
  hanger:   'checkroom',
  spark:    'auto_awesome',
  profile:  'person',
  bookmark: 'bookmark',
  settings: 'settings',
  home:     'home',
  add:      'add_circle',
  close:    'close',
  menu:     'menu',
  search:   'search',
  camera:   'photo_camera',
  upload:   'upload',
  magic:    'auto_fix_high',
  star:     'star',
  heart:    'favorite',
  edit:     'edit',
  trash:    'delete',
  check:    'check_circle',
  info:     'info',
  warning:  'warning',
  arrow:    'arrow_forward',
};

export function AppGlyph({
  name,
  active = false,
  size = 22,
  className = '',
}: {
  name: string;
  active?: boolean;
  size?: number;
  className?: string;
}) {
  const iconName = GLYPH_MAP[name] ?? name;
  return (
    <MaterialIcon
      name={iconName}
      filled={active}
      size={size}
      className={className}
    />
  );
}

/* ──────────────────────────────────────────────────────────────
   WindowDots — three decorative dots (desktop left panel)
   ────────────────────────────────────────────────────────────── */
export function WindowDots() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full"
            style={{ background: 'var(--surface-high)', border: '1px solid var(--line)' }} />
      <span className="h-2.5 w-2.5 rounded-full"
            style={{ background: 'var(--accent)', border: '1px solid rgba(208,188,255,0.3)' }} />
      <span className="h-2.5 w-2.5 rounded-full"
            style={{ background: 'var(--accent-2)', border: '1px solid rgba(79,219,200,0.3)' }} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   SectionKicker — uppercase label
   ────────────────────────────────────────────────────────────── */
export function SectionKicker({ children }: { children: ReactNode }) {
  return <p className="section-kicker">{children}</p>;
}

/* ──────────────────────────────────────────────────────────────
   SurfaceBadge — themed pill badge
   ────────────────────────────────────────────────────────────── */
export function SurfaceBadge({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'accent' | 'accent-soft' | 'live' | 'fallback' | 'warning';
}) {
  const toneStyle =
    tone === 'accent'
      ? {
          borderColor: 'rgba(208,188,255,0.3)',
          background: 'rgba(208,188,255,0.12)',
          color: 'var(--accent)',
          boxShadow: '0 8px 20px rgba(160,120,255,0.15)',
        }
      : tone === 'accent-soft'
        ? {
            borderColor: 'var(--line)',
            background: 'var(--surface-high)',
            color: 'var(--muted-strong)',
          }
        : tone === 'live'
          ? {
              borderColor: 'rgba(79,219,200,0.3)',
              background: 'linear-gradient(135deg, rgba(79,219,200,0.22), rgba(208,188,255,0.14))',
              color: 'var(--accent-2)',
              boxShadow: '0 8px 20px rgba(79,219,200,0.15)',
            }
          : tone === 'fallback'
            ? {
                borderColor: 'rgba(230,199,122,0.3)',
                background: 'rgba(230,199,122,0.12)',
                color: 'var(--warning)',
              }
            : tone === 'warning'
              ? {
                  borderColor: 'rgba(255,180,171,0.3)',
                  background: 'rgba(255,180,171,0.1)',
                  color: 'var(--danger)',
                }
              : {
                  borderColor: 'var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--muted-strong)',
                };

  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em]"
      style={toneStyle}
    >
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   Panel — surface container with tonal variants
   ────────────────────────────────────────────────────────────── */
export function Panel({
  children,
  className,
  variant = 'solid',
}: {
  children: ReactNode;
  className?: string;
  variant?: 'soft' | 'glass' | 'solid';
}) {
  return (
    <div
      className={cx(
        'rounded-[1.5rem]',
        variant === 'soft'  && 'panel-variant-soft',
        variant === 'glass' && 'panel-variant-glass',
        variant === 'solid' && 'panel-variant-solid',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   ItemArtwork — wardrobe item card with image or gradient placeholder
   ────────────────────────────────────────────────────────────── */
export function ItemArtwork({
  palette,
  label,
  compact = false,
  imageUrl,
  imageDataUrl,
}: {
  palette: string;
  label: string;
  compact?: boolean;
  imageUrl?: string | null;
  imageDataUrl?: string | null;
}) {
  const src = imageUrl ?? imageDataUrl ?? null;
  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-[1.5rem]',
        'border border-[var(--line)]',
        'shadow-[var(--shadow-soft)]',
        compact ? 'aspect-[1.1/1]' : 'aspect-[1.02/1.18]',
      )}
    >
      <div className={cx('absolute inset-0 bg-gradient-to-br', palette)} />
      {src ? (
        <>
          <img src={src} alt={label} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.5))]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_42%)]" />
          <div className="absolute left-[18%] top-[14%] h-[56%] w-[30%] rounded-[999px] bg-white/10" />
          <div className="absolute left-[38%] top-[18%] h-[54%] w-[24%] rounded-[999px] bg-black/10" />
          <div className="absolute left-[28%] top-[50%] h-[28%] w-[42%] rounded-[1.5rem] bg-white/8" />
        </>
      )}
      <div className="absolute bottom-3 left-3 rounded-full px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-white font-semibold backdrop-blur-xl"
           style={{ background: 'rgba(19,19,19,0.7)', border: '1px solid rgba(73,68,84,0.3)' }}>
        {label}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   WardrobeMosaic — grid of up to 4 wardrobe items
   ────────────────────────────────────────────────────────────── */
export function WardrobeMosaic({
  items,
  label,
}: {
  items: Array<{
    id: string;
    name: string;
    palette: string;
    imageUrl?: string | null;
    imageDataUrl?: string | null;
  }>;
  label: string;
}) {
  const visibleItems = items.slice(0, 4);
  const gridClass =
    visibleItems.length <= 1
      ? 'grid-cols-1'
      : 'grid-cols-2';

  if (visibleItems.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--line)] p-4"
           style={{ background: 'var(--surface-strong)' }}>
        <div className="flex aspect-[1.08/1] items-center justify-center rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 text-center text-sm leading-7 text-[var(--muted)]">
          Upload owned wardrobe pieces to generate a look here.
        </div>
        <div className="absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-[var(--muted-strong)] backdrop-blur-xl"
             style={{ background: 'var(--surface-high)', border: '1px solid var(--line)' }}>
          {label}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--line)] p-3"
         style={{ background: 'var(--surface-strong)' }}>
      <div className={cx('grid gap-3', gridClass)}>
        {visibleItems.map((item) => (
          <ItemArtwork
            key={item.id}
            palette={item.palette}
            imageUrl={item.imageUrl}
            imageDataUrl={item.imageDataUrl}
            label={item.name}
            compact={visibleItems.length !== 1}
          />
        ))}
      </div>
      <div className="absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-[var(--muted-strong)] backdrop-blur-xl"
           style={{ background: 'var(--surface-high)', border: '1px solid var(--line)' }}>
        {label}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MetricCard — single stat card
   ────────────────────────────────────────────────────────────── */
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
    <Panel className="relative overflow-hidden p-5" variant="solid">
      <div className="absolute inset-x-5 top-0 h-px"
           style={{ background: 'linear-gradient(90deg,transparent,rgba(208,188,255,0.3),transparent)' }} />
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-strong)]">{label}</p>
      <p className="font-headline mt-5 text-[2.4rem] tracking-[-0.08em] text-[var(--text)]">{value}</p>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{detail}</p>
    </Panel>
  );
}

/* ──────────────────────────────────────────────────────────────
   MotionCard — hover-lift wrapper
   ────────────────────────────────────────────────────────────── */
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
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.01 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

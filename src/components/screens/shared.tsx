import type { ReactNode } from 'react';
import type { OutfitSuggestion } from '../../data/wearData';
import { SectionKicker } from '../Chrome';

export function ScreenHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-end">
      <div className="max-w-[48rem]">
        <SectionKicker>{eyebrow}</SectionKicker>
        <h1 className="mt-4 font-display text-[clamp(1.6rem,7vw,2.618rem)] leading-[0.96] tracking-[-0.06em] text-[var(--text)] xl:text-[4.236rem]">
          {title}
        </h1>
        <p className="mt-4 max-w-[44rem] text-[1rem] leading-[1.618] text-[var(--muted)]">{description}</p>
      </div>
      {action ? <div className="flex flex-wrap items-start gap-3 2xl:justify-end">{action}</div> : null}
    </div>
  );
}

export function PieceList({ outfit }: { outfit: OutfitSuggestion }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {outfit.pieces.map((piece, index) => (
        <div
          key={piece}
          className="rounded-[20px] px-4 py-4"
          style={{ background: 'var(--surface-strong)', border: '1px solid var(--line)' }}
        >
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>
            {['Layer', 'Top', 'Bottom', 'Finish'][index] ?? 'Piece'}
          </p>
          <p className="mt-3 text-[0.98rem]" style={{ color: 'var(--text)' }}>{piece}</p>
        </div>
      ))}
    </div>
  );
}

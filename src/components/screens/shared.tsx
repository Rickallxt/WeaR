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
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <SectionKicker>{eyebrow}</SectionKicker>
        <h1 className="mt-4 font-display text-[2.4rem] leading-[0.98] tracking-[-0.06em] text-[var(--text)] xl:text-[3.3rem]">
          {title}
        </h1>
        <p className="mt-4 max-w-[42rem] text-[1rem] leading-8 text-[var(--muted)]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function PieceList({ outfit }: { outfit: OutfitSuggestion }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {outfit.pieces.map((piece, index) => (
        <div
          key={piece}
          className="rounded-[20px] border border-white/80 bg-white/82 px-4 py-4 shadow-[0_12px_32px_rgba(17,18,23,0.05)]"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
            {['Layer', 'Top', 'Bottom', 'Finish'][index] ?? 'Piece'}
          </p>
          <p className="mt-3 text-[0.98rem] text-[var(--text)]">{piece}</p>
        </div>
      ))}
    </div>
  );
}

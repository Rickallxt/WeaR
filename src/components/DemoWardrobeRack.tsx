import type { WardrobeItem } from '../data/wearData';
import { Panel, SectionKicker, SurfaceBadge } from './Chrome';

export function DemoWardrobeRack({
  items,
  selectedIds,
  existingIds,
  onToggle,
  onAddSelected,
  compact = false,
}: {
  items: WardrobeItem[];
  selectedIds: string[];
  existingIds: string[];
  onToggle: (itemId: string) => void;
  onAddSelected: () => void;
  compact?: boolean;
}) {
  const addableCount = selectedIds.filter((itemId) => !existingIds.includes(itemId)).length;

  return (
    <Panel className={compact ? 'p-5' : 'p-6 xl:p-8'} variant="soft">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <SectionKicker>Example wardrobe pieces</SectionKicker>
          <p className="mt-3 max-w-[36rem] text-[1rem] leading-7 text-[var(--text)]">
            Add curated demo garments when you want to explore WeaR without uploading every piece first.
          </p>
        </div>
        <button
          type="button"
          disabled={addableCount === 0}
          onClick={onAddSelected}
          className="button-primary text-sm"
        >
          {addableCount > 0 ? `Add ${addableCount} example item${addableCount > 1 ? 's' : ''}` : 'Select demo items'}
        </button>
      </div>

      <div className={`mt-6 grid gap-4 ${compact ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 2xl:grid-cols-5'}`}>
        {items.map((item) => {
          const added = existingIds.includes(item.id);
          const selected = selectedIds.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              disabled={added}
              onClick={() => onToggle(item.id)}
              className="text-left"
            >
              <Panel
                className={`h-full p-4 transition duration-300 ${
                  selected ? 'ring-2 ring-[rgba(152,161,255,0.34)]' : ''
                } ${added ? 'opacity-60' : 'hover:-translate-y-[2px]'}`}
                variant={selected ? 'glass' : 'solid'}
              >
                <div className="relative overflow-hidden rounded-[22px] border border-white/80">
                  <img src={item.imageDataUrl ?? ''} alt={item.name} className="aspect-[1.02/1.14] w-full object-cover" />
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                    <SurfaceBadge tone={selected ? 'accent' : 'default'}>{selected ? 'Selected' : item.category}</SurfaceBadge>
                    {added ? <SurfaceBadge tone="accent-soft">In wardrobe</SurfaceBadge> : null}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-[1rem] text-[var(--text)]">{item.name}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{item.category} / {item.fit}</p>
                </div>
              </Panel>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

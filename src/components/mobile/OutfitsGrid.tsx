import { MaterialIcon, Panel, SurfaceBadge, WardrobeMosaic } from '../Chrome';
import type { WardrobeItem } from '../../data/wearData';

export type SavedOutfitRecord = {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: string;
  coverImageDataUrl?: string;
  vibe?: string;
  timesWorn: number;
  lastWornAt?: string;
};

export function OutfitsGrid({
  outfits,
  wardrobe,
  onUseInChat,
  onDelete,
  onEdit,
  emptyTitle = 'No saved outfits yet',
  emptyDescription = 'Approve a look in chat to keep it here for quick reuse.',
}: {
  outfits: SavedOutfitRecord[];
  wardrobe: WardrobeItem[];
  onUseInChat: (outfit: SavedOutfitRecord) => void;
  onDelete: (outfit: SavedOutfitRecord) => void;
  onEdit?: (outfit: SavedOutfitRecord) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (outfits.length === 0) {
    return (
      <Panel className="overflow-hidden border border-[var(--line)] p-5" variant="solid">
        <div className="rounded-[1.35rem] border border-dashed border-[var(--line)] px-5 py-8 text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), color-mix(in srgb, var(--accent-2) 14%, transparent))',
              border: '1px solid color-mix(in srgb, var(--accent) 24%, transparent)',
            }}
          >
            <MaterialIcon name="bookmark" size={26} style={{ color: 'var(--accent)' }} filled />
          </div>
          <h3
            className="mt-4 text-[1.1rem] font-bold tracking-[-0.03em]"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-headline)' }}
          >
            {emptyTitle}
          </h3>
          <p className="mx-auto mt-2 max-w-[18rem] text-sm leading-6" style={{ color: 'var(--muted)' }}>
            {emptyDescription}
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <div className="grid gap-4">
      {outfits.map((outfit) => {
        const items = resolveOutfitItems(outfit, wardrobe);
        return (
          <Panel
            key={outfit.id}
            className="overflow-hidden border border-[var(--line)] p-3 shadow-[var(--shadow-soft)]"
            variant="soft"
          >
            <OutfitPreview outfit={outfit} items={items} />

            <div className="px-1 pb-1 pt-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {outfit.vibe ? <SurfaceBadge tone="accent-soft">{outfit.vibe}</SurfaceBadge> : null}
                    <SurfaceBadge>{items.length || outfit.itemIds.length} piece{(items.length || outfit.itemIds.length) === 1 ? '' : 's'}</SurfaceBadge>
                  </div>
                  <h3
                    className="mt-3 truncate text-[1.1rem] font-bold tracking-[-0.04em]"
                    style={{ color: 'var(--text)', fontFamily: 'var(--font-headline)' }}
                  >
                    {outfit.name}
                  </h3>
                  <p className="mt-1 text-sm leading-6" style={{ color: 'var(--muted)' }}>
                    {buildOutfitCaption(outfit, items.length)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onEdit ? (
                    <button
                      type="button"
                      onClick={() => onEdit(outfit)}
                      className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95"
                      style={{ background: 'var(--surface-high)', border: '1px solid var(--line)', color: 'var(--muted-strong)' }}
                      aria-label={`Edit ${outfit.name}`}
                    >
                      <MaterialIcon name="edit" size={18} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onDelete(outfit)}
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95"
                    style={{
                      background: 'color-mix(in srgb, var(--danger) 10%, var(--surface-high))',
                      border: '1px solid color-mix(in srgb, var(--danger) 24%, transparent)',
                      color: 'var(--danger)',
                    }}
                    aria-label={`Delete ${outfit.name}`}
                  >
                    <MaterialIcon name="delete" size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <StatPill
                  label="Saved"
                  value={formatDate(outfit.createdAt)}
                  icon="schedule"
                />
                <StatPill
                  label="Worn"
                  value={`${outfit.timesWorn}`}
                  icon="history"
                />
                <StatPill
                  label="Last used"
                  value={outfit.lastWornAt ? formatDate(outfit.lastWornAt) : 'New'}
                  icon="event_available"
                />
              </div>

              {items.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {items.slice(0, 4).map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium"
                      style={{ background: 'var(--surface-high)', borderColor: 'var(--line)', color: 'var(--muted-strong)' }}
                    >
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ background: item.color?.toLowerCase() === 'black' ? '#52525b' : 'var(--accent-2)' }}
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-3">
                <button type="button" onClick={() => onUseInChat(outfit)} className="button-primary flex-1 gap-2">
                  <MaterialIcon name="auto_awesome" size={18} />
                  Use in chat
                </button>
                {onEdit ? (
                  <button type="button" onClick={() => onEdit(outfit)} className="button-secondary px-4">
                    Edit
                  </button>
                ) : null}
              </div>
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

function OutfitPreview({
  outfit,
  items,
}: {
  outfit: SavedOutfitRecord;
  items: WardrobeItem[];
}) {
  if (items.length > 0) {
    return (
      <div className="relative">
        <WardrobeMosaic
          items={items.slice(0, 4).map((item) => ({
            id: item.id,
            name: item.name,
            palette: item.palette,
            imageUrl: item.imageUrl,
            imageDataUrl: item.imageDataUrl,
          }))}
          label={outfit.name}
        />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between">
          <SurfaceBadge tone="live">Ready to reuse</SurfaceBadge>
          <SurfaceBadge tone="accent">{items.length} selected</SurfaceBadge>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[1.5rem] border border-[var(--line)]"
      style={{ background: 'var(--surface-strong)' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 20%, transparent), transparent 48%), linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, var(--surface-strong)) 0%, var(--surface) 100%)',
        }}
      />
      {outfit.coverImageDataUrl ? (
        <img
          src={outfit.coverImageDataUrl}
          alt={outfit.name}
          className="relative aspect-[1.08/1] w-full object-cover"
        />
      ) : (
        <div className="relative aspect-[1.08/1] w-full">
          <div className="absolute left-[16%] top-[16%] h-[54%] w-[26%] rounded-[999px] bg-white/10" />
          <div className="absolute left-[42%] top-[18%] h-[46%] w-[20%] rounded-[999px] bg-black/10" />
          <div className="absolute left-[28%] top-[54%] h-[22%] w-[44%] rounded-[1.25rem] bg-white/10" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.65))] px-4 pb-4 pt-8">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em]" style={{ color: 'rgba(255,255,255,0.68)' }}>
          Saved outfit
        </p>
        <p
          className="mt-2 text-[1.1rem] font-bold tracking-[-0.03em]"
          style={{ color: 'white', fontFamily: 'var(--font-headline)' }}
        >
          {outfit.name}
        </p>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div
      className="rounded-[1rem] px-3 py-3"
      style={{ background: 'var(--surface-high)', border: '1px solid var(--line)' }}
    >
      <div className="flex items-center gap-1.5">
        <MaterialIcon name={icon} size={14} style={{ color: 'var(--accent-2)' }} />
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
          {label}
        </p>
      </div>
      <p className="mt-2 truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>
        {value}
      </p>
    </div>
  );
}

function resolveOutfitItems(outfit: SavedOutfitRecord, wardrobe: WardrobeItem[]) {
  const wardrobeMap = new Map(wardrobe.map((item) => [item.id, item]));
  return outfit.itemIds
    .map((itemId) => wardrobeMap.get(itemId))
    .filter((item): item is WardrobeItem => Boolean(item));
}

function buildOutfitCaption(outfit: SavedOutfitRecord, matchedCount: number) {
  if (outfit.vibe && matchedCount > 0) {
    return `${outfit.vibe} with ${matchedCount} linked wardrobe piece${matchedCount === 1 ? '' : 's'}.`;
  }
  if (outfit.vibe) {
    return `${outfit.vibe} saved for quick reuse the next time you need an instant answer.`;
  }
  if (matchedCount > 0) {
    return `${matchedCount} linked wardrobe piece${matchedCount === 1 ? '' : 's'} ready to send back into chat.`;
  }
  return 'Saved from a prior styling moment and ready to reopen.';
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

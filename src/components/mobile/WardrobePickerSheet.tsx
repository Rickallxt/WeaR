import { useMemo, useState } from 'react';
import { MaterialIcon, SurfaceBadge } from '../Chrome';
import { BottomSheet } from './BottomSheet';
import { resolveWardrobeImageSrc, type WardrobeItem } from '../../data/wearData';

export function WardrobePickerSheet({
  open,
  wardrobe,
  selectedItemIds = [],
  allowLaundrySelection = false,
  title = 'Choose from wardrobe',
  confirmLabel = 'Add to chat',
  onClose,
  onConfirm,
}: {
  open: boolean;
  wardrobe: Array<WardrobeItem & { inLaundry?: boolean }>;
  selectedItemIds?: string[];
  allowLaundrySelection?: boolean;
  title?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (itemIds: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [draftSelection, setDraftSelection] = useState<string[]>(selectedItemIds);
  const [draftSelectionKey, setDraftSelectionKey] = useState(() => buildSelectionKey(selectedItemIds));
  const externalSelectionKey = buildSelectionKey(selectedItemIds);
  const activeSelection =
    draftSelectionKey === externalSelectionKey ? draftSelection : selectedItemIds;

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = wardrobe.filter((item) => {
      if (!normalized) return true;
      const haystack = [
        item.name,
        item.category,
        item.color,
        item.fit,
        item.material,
        ...(item.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalized);
    });

    return filtered.sort((left, right) => {
      const leftLaundry = Boolean(left.inLaundry);
      const rightLaundry = Boolean(right.inLaundry);
      if (leftLaundry !== rightLaundry) return leftLaundry ? 1 : -1;
      return left.name.localeCompare(right.name);
    });
  }, [query, wardrobe]);

  const selectedCount = activeSelection.length;

  function handleClose() {
    setQuery('');
    onClose();
  }

  function toggleItem(item: WardrobeItem & { inLaundry?: boolean }) {
    if (item.inLaundry && !allowLaundrySelection) return;
    const baseSelection =
      draftSelectionKey === externalSelectionKey ? draftSelection : selectedItemIds;
    setDraftSelectionKey(externalSelectionKey);
    setDraftSelection(
      baseSelection.includes(item.id)
        ? baseSelection.filter((itemId) => itemId !== item.id)
        : [...baseSelection, item.id],
    );
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={title}>
      <div className="flex min-h-[24rem] max-h-[72dvh] flex-col">
        <div className="flex items-center gap-3 rounded-[1.25rem] border px-4 py-3" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
          <MaterialIcon name="search" size={18} style={{ color: 'var(--muted)' }} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pieces, colors, moods"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
            style={{ color: 'var(--text)' }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>
            Pick a few pieces and the chat will treat them as the wardrobe you want considered right now.
          </p>
          {selectedCount > 0 ? <SurfaceBadge tone="accent">{selectedCount} selected</SurfaceBadge> : null}
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
          {visibleItems.length === 0 ? (
            <div
              className="rounded-[1.5rem] border border-dashed px-5 py-8 text-center"
              style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
            >
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}
              >
                <MaterialIcon name="checkroom" size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="mt-4 text-base font-semibold" style={{ color: 'var(--text)' }}>
                No matches found
              </p>
              <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>
                Try a category, color, or piece name instead.
              </p>
            </div>
          ) : (
            visibleItems.map((item) => {
              const selected = activeSelection.includes(item.id);
              const disabled = Boolean(item.inLaundry) && !allowLaundrySelection;
              const src = resolveWardrobeImageSrc(item);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item)}
                  disabled={disabled}
                  className="w-full rounded-[1.4rem] p-3 text-left transition-transform active:scale-[0.99] disabled:cursor-not-allowed"
                  style={{
                    background: selected ? 'color-mix(in srgb, var(--accent) 10%, var(--surface-high))' : 'var(--surface)',
                    border: selected ? '1px solid color-mix(in srgb, var(--accent) 34%, transparent)' : '1px solid var(--line)',
                    opacity: disabled ? 0.62 : 1,
                    boxShadow: selected ? '0 18px 34px rgba(160,120,255,0.18)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[1.15rem]"
                      style={{ background: item.palette ? undefined : 'var(--surface-high)' }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.palette || 'from-[#252525] to-[#1a1a1a]'}`} />
                      {src ? <img src={src} alt={item.name} className="absolute inset-0 h-full w-full object-cover" /> : null}
                      {item.inLaundry ? (
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,19,19,0.15),rgba(19,19,19,0.68))]" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
                            {item.category} · {item.color}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.inLaundry ? <SurfaceBadge tone="warning">In laundry</SurfaceBadge> : null}
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-full"
                            style={{
                              background: selected ? 'var(--accent)' : 'var(--surface-high)',
                              color: selected ? 'var(--on-accent)' : 'var(--muted-strong)',
                              border: selected ? 'none' : '1px solid var(--line)',
                            }}
                          >
                            <MaterialIcon name={selected ? 'check' : 'add'} size={16} />
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className="inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
                          style={{ background: 'var(--surface-high)', borderColor: 'var(--line)', color: 'var(--muted-strong)' }}
                        >
                          {item.fit}
                        </span>
                        <span
                          className="inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
                          style={{ background: 'var(--surface-high)', borderColor: 'var(--line)', color: 'var(--muted-strong)' }}
                        >
                          {item.material}
                        </span>
                      </div>

                      {item.inLaundry ? (
                        <p className="mt-2 text-xs leading-5" style={{ color: 'var(--warning)' }}>
                          Remove it from laundry before sending it back into styling.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleClose} className="button-secondary flex-1">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                onConfirm(activeSelection);
              }}
              disabled={selectedCount === 0}
              className="button-primary flex-1 gap-2"
            >
              <MaterialIcon name="checkroom" size={18} />
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

function buildSelectionKey(itemIds: string[]) {
  return itemIds.join('::');
}

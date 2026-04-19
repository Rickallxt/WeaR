import { useState } from 'react';
import { alternateOutfits, todayOutfit, type SavedCollection, type WardrobeItem } from '../../data/wearData';
import { MotionCard, Panel, SectionKicker, SurfaceBadge, WardrobeMosaic } from '../Chrome';
import { getWardrobeItemsForOutfit } from './wardrobeUtils';
import { ScreenHeader } from './shared';

const VIBES = ['Quiet sharpness', 'Clean relaxed', 'Layered utility', 'Dressed casual', 'Evening polish', 'Weekend ease'];

function newCollection(wardrobe: WardrobeItem[]): SavedCollection {
  const topPins = wardrobe.slice(0, 3).map((item) => item.name);
  return {
    id: `sc-${Date.now()}`,
    title: 'New collection',
    count: 0,
    vibe: 'Clean relaxed',
    palette: 'from-[#e6e4ff] via-[#fffaf2] to-[#e8f2dd]',
    pins: topPins,
  };
}

function CollectionCard({
  collection,
  wardrobe,
  onUpdate,
  onDelete,
}: {
  collection: SavedCollection;
  wardrobe: WardrobeItem[];
  onUpdate: (updated: SavedCollection) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(collection.title);
  const [vibe, setVibe] = useState(collection.vibe);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mosaicItems = getWardrobeItemsForOutfit(wardrobe, collection.pins);

  function handleSave() {
    onUpdate({ ...collection, title: title.trim() || collection.title, vibe });
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditing(false);
  }

  return (
    <MotionCard>
      <Panel className="h-full p-5 xl:p-6" variant="glass">
        <WardrobeMosaic items={mosaicItems} label={collection.vibe} />

        <div className="mt-5">
          {editing ? (
            <div className="space-y-3">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-[16px] border border-[rgba(24,24,29,0.08)] px-3 py-2 text-[1rem] text-[var(--text)] outline-none focus:border-[rgba(152,161,255,0.5)]"
                style={{ background: 'var(--surface-high)' }}
              />
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full rounded-[16px] border border-[rgba(24,24,29,0.08)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[rgba(152,161,255,0.5)]"
                style={{ background: 'var(--surface-high)' }}
              >
                {VIBES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={handleSave} className="button-primary flex-1 text-sm">
                  Save
                </button>
                <button type="button" onClick={() => setEditing(false)} className="button-secondary text-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[1.05rem] text-[var(--text)]">{collection.title}</p>
                  <p className="mt-1.5 text-sm text-[var(--muted)]">{collection.count} saved looks</p>
                </div>
                <SurfaceBadge tone="accent-soft">{collection.vibe}</SurfaceBadge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {collection.pins.slice(0, 3).map((pin) => (
                  <SurfaceBadge key={pin}>{pin}</SurfaceBadge>
                ))}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setEditing(true); setConfirmDelete(false); }}
                  className="flex-1 rounded-full border border-[rgba(24,24,29,0.08)] px-3 py-2 text-[0.78rem] uppercase tracking-[0.18em] text-[var(--text)] transition duration-200"
                  style={{ background: 'var(--surface)' }}
                >
                  Edit
                </button>
                {confirmDelete ? (
                  <>
                    <button
                      type="button"
                      onClick={onDelete}
                      className="flex-1 rounded-full bg-[rgba(255,80,80,0.1)] px-3 py-2 text-[0.78rem] uppercase tracking-[0.18em] text-[#cc3333] transition duration-200 hover:bg-[rgba(255,80,80,0.18)]"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-full border border-[rgba(24,24,29,0.08)] px-3 py-2 text-[0.78rem] uppercase tracking-[0.18em] text-[var(--muted-strong)] transition duration-200"
                      style={{ background: 'var(--surface)' }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-full border border-[rgba(24,24,29,0.08)] px-3 py-2 text-[0.78rem] uppercase tracking-[0.18em] text-[var(--muted-strong)] transition duration-200"
                    style={{ background: 'var(--surface)' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Panel>
    </MotionCard>
  );
}

export function SavedLooksScreen({
  wardrobe,
  collections,
  onCollectionsChange,
}: {
  wardrobe: WardrobeItem[];
  collections: SavedCollection[];
  onCollectionsChange: (collections: SavedCollection[]) => void;
}) {
  function handleUpdate(updated: SavedCollection) {
    onCollectionsChange(collections.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDelete(id: string) {
    onCollectionsChange(collections.filter((c) => c.id !== id));
  }

  function handleCreate() {
    onCollectionsChange([...collections, newCollection(wardrobe)]);
  }

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Saved looks"
        title="Collections and pins"
        description="Revisit the combinations that work best by vibe, season, and real-world use. Save the formulas that make your wardrobe easier to repeat."
        action={
          <div className="flex flex-wrap gap-3">
            <SurfaceBadge tone="accent-soft">{collections.length} collections</SurfaceBadge>
            <SurfaceBadge tone="accent">Pinned for repeat wear</SurfaceBadge>
            <button
              type="button"
              onClick={handleCreate}
              className="button-primary text-sm"
            >
              New collection
            </button>
          </div>
        }
      />

      {collections.length === 0 ? (
        <Panel className="px-6 py-12" variant="soft">
          <p className="text-center text-[1.1rem] text-[var(--text)]">No collections yet.</p>
          <p className="mt-3 text-center text-sm text-[var(--muted)]">
            Create a collection to start pinning your best outfit formulas.
          </p>
          <div className="mt-6 flex justify-center">
            <button type="button" onClick={handleCreate} className="button-primary text-sm">
              Create first collection
            </button>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              wardrobe={wardrobe}
              onUpdate={handleUpdate}
              onDelete={() => handleDelete(collection.id)}
            />
          ))}
        </div>
      )}

      <Panel className="p-6 xl:p-8" variant="soft">
        <SectionKicker>Pinned combinations</SectionKicker>
        <div className="mt-6 grid gap-4 xl:grid-cols-4">
          {[todayOutfit, ...alternateOutfits].map((outfit) => (
            <Panel key={outfit.id} className="p-4" variant="solid">
              <WardrobeMosaic items={getWardrobeItemsForOutfit(wardrobe, outfit.pieces)} label="Pinned" />
              <p className="mt-4 text-[0.98rem] text-[var(--text)]">{outfit.title}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{outfit.vibe}</p>
            </Panel>
          ))}
        </div>
      </Panel>
    </div>
  );
}

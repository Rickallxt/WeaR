import { useDeferredValue, useState } from 'react';
import type { WardrobeItem } from '../../data/wearData';
import { cx } from '../../lib/cx';
import { ItemArtwork, MotionCard, Panel, SectionKicker, SurfaceBadge } from '../Chrome';
import { DemoWardrobeRack } from '../DemoWardrobeRack';
import { ScreenHeader } from './shared';

function formatSourceLabel(item: WardrobeItem) {
  return {
    seed: 'Curated visual',
    example: 'Example item',
    upload: 'Uploaded item',
  }[item.source ?? 'seed'];
}

function formatDetectionLabel(item: WardrobeItem) {
  return {
    curated: 'Curated',
    'auto-detected': 'Auto-detected',
    reviewed: 'Reviewed',
    error: 'Needs review',
  }[item.detection?.state ?? 'curated'];
}

function detectionTone(item: WardrobeItem): 'default' | 'accent' | 'accent-soft' {
  if (item.detection?.state === 'reviewed') {
    return 'accent';
  }

  if (item.detection?.state === 'auto-detected' || item.detection?.state === 'curated') {
    return 'accent-soft';
  }

  return 'default';
}

export function WardrobeScreen({
  wardrobe,
  exampleItems,
  onUploadPhoto,
  onUploadNewItem,
  onAddExampleItems,
}: {
  wardrobe: WardrobeItem[];
  exampleItems: WardrobeItem[];
  onUploadPhoto: (itemId: string, file: File) => Promise<void>;
  onUploadNewItem: (file: File) => Promise<void>;
  onAddExampleItems: (itemIds: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [exampleSelection, setExampleSelection] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<'All' | 'Tops' | 'Bottoms' | 'Shoes' | 'Outerwear' | 'Accessories'>('All');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'mine' | 'example'>('all');
  const uploadedCount = wardrobe.filter((item) => Boolean(item.imageDataUrl)).length;
  const existingIds = wardrobe.map((item) => item.id);
  const myItemCount = wardrobe.filter((item) => item.source !== 'example').length;
  const exampleItemCount = wardrobe.filter((item) => item.source === 'example').length;

  const filteredItems = wardrobe.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    const matchesSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'mine' && item.source !== 'example') ||
      (sourceFilter === 'example' && item.source === 'example');
    const haystack = `${item.name} ${item.category} ${item.tags.join(' ')} ${item.material}`.toLowerCase();
    const matchesQuery = haystack.includes(deferredQuery.trim().toLowerCase());
    return matchesCategory && matchesSource && matchesQuery;
  });

  function toggleExampleSelection(itemId: string) {
    setExampleSelection((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );
  }

  function handleAddSelectedExamples() {
    const nextIds = exampleSelection.filter((itemId) => !existingIds.includes(itemId));

    if (nextIds.length === 0) {
      return;
    }

    onAddExampleItems(nextIds);
    setExampleSelection([]);
    setUploadError('');
  }

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Wardrobe"
        title="Closet builder"
        description="Map what you own, tag it with fit and occasion data, and browse it in a visual system that feels closer to an editorial wardrobe rack than a spreadsheet."
        action={
          <div className="flex flex-wrap gap-3">
            <SurfaceBadge tone="accent-soft">{uploadedCount}/{wardrobe.length} photos mapped</SurfaceBadge>
            <SurfaceBadge tone="accent">Generation-ready wardrobe</SurfaceBadge>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.32fr_0.68fr]">
        <div className="space-y-6">
          <Panel className="p-5" variant="solid">
            <SectionKicker>Filters</SectionKicker>
            <div className="mt-5 flex flex-wrap gap-2">
              {(['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cx(
                    'rounded-full border px-4 py-2 text-sm transition duration-300',
                    category === item
                      ? 'border-[rgba(143,150,255,0.34)] bg-[rgba(143,150,255,0.12)] text-[var(--text)]'
                      : 'border-[rgba(24,24,29,0.08)] bg-white/80 text-[var(--muted)]',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Source</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {([
                  { key: 'all', label: `All (${wardrobe.length})` },
                  { key: 'mine', label: `My items (${myItemCount})` },
                  { key: 'example', label: `Examples (${exampleItemCount})` },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSourceFilter(key)}
                    className={cx(
                      'rounded-full border px-4 py-2 text-sm transition duration-300',
                      sourceFilter === key
                        ? 'border-[rgba(200,223,113,0.5)] bg-[rgba(200,223,113,0.18)] text-[var(--text)]'
                        : 'border-[rgba(24,24,29,0.08)] bg-white/80 text-[var(--muted)]',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Search wardrobe</label>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by piece, tag, or material"
                className="mt-3 h-14 w-full rounded-full border border-[rgba(24,24,29,0.08)] bg-white px-5 text-[var(--text)] outline-none focus:border-[rgba(143,150,255,0.5)]"
              />
            </div>
          </Panel>

          <Panel className="p-5" variant="soft">
            <SectionKicker>Quick add</SectionKicker>
            <p className="mt-4 text-[1rem] leading-7 text-[var(--text)]">
              Upload a new piece, let WeaR auto-identify it, then confirm the result before it enters your wardrobe.
            </p>
            <div className="mt-5 grid gap-3">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[22px] bg-white/84 px-4 py-4 text-sm text-[var(--text)] transition duration-300 hover:-translate-y-[1px]">
                <div>
                  <p className="text-[0.98rem] text-[var(--text)]">Upload new item photo</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Auto-detect category, color, fit, and material from the image.
                  </p>
                </div>
                <SurfaceBadge tone="accent">Review flow</SurfaceBadge>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }

                    try {
                      await onUploadNewItem(file);
                      setUploadError('');
                    } catch (uploadFailure) {
                      setUploadError(
                        uploadFailure instanceof Error
                          ? uploadFailure.message
                          : 'Unable to analyze that uploaded wardrobe piece right now.',
                      );
                    }
                    event.target.value = '';
                  }}
                />
              </label>

              {[
                'Curated example rack for demo wardrobe building.',
                'Upload review modal to confirm auto-detected item details.',
                'Wardrobe cards stay focused on owned pieces, not shopping prompts.',
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-white/80 px-4 py-4 text-sm leading-6 text-[var(--text)]">
                  {item}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-6 xl:p-8" variant="glass">
            <div className="flex items-center justify-between gap-4">
              <div>
                <SectionKicker>Mapped wardrobe</SectionKicker>
                <p className="mt-4 text-[1.45rem] text-[var(--text)]">{filteredItems.length} visible pieces</p>
              </div>
              <SurfaceBadge tone="accent">Wardrobe-first engine</SurfaceBadge>
            </div>

            {uploadError ? (
              <div className="mt-5 rounded-[20px] border border-[rgba(24,24,29,0.08)] bg-white/80 px-4 py-3 text-sm text-[var(--text)]">
                {uploadError}
              </div>
            ) : null}

            {filteredItems.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-[rgba(24,24,29,0.14)] bg-white/72 px-6 py-8 text-sm leading-7 text-[var(--muted)]">
                No wardrobe pieces match this filter. Try a different category or a broader search.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {filteredItems.map((item) => (
                  <MotionCard key={item.id}>
                    <Panel
                      className={cx(
                        'h-full p-4',
                        item.source === 'example' && 'border border-dashed border-[rgba(200,223,113,0.5)]',
                      )}
                      variant="solid"
                    >
                      <ItemArtwork palette={item.palette} imageUrl={item.imageDataUrl} label={item.status} />
                      <div className="mt-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[1rem] text-[var(--text)]">{item.name}</p>
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            {item.category} / {item.fit}
                          </p>
                        </div>
                        <SurfaceBadge>{item.color}</SurfaceBadge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <SurfaceBadge>{formatSourceLabel(item)}</SurfaceBadge>
                        <SurfaceBadge tone={detectionTone(item)}>{formatDetectionLabel(item)}</SurfaceBadge>
                        {item.detection ? (
                          <SurfaceBadge>{Math.round(item.detection.confidence * 100)}% match</SurfaceBadge>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-[var(--muted)]">{item.material}</p>
                      {item.styleNote ? (
                        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.styleNote}</p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <SurfaceBadge key={tag}>{tag}</SurfaceBadge>
                        ))}
                      </div>
                      <label className="mt-4 inline-flex cursor-pointer items-center rounded-full border border-[rgba(24,24,29,0.08)] bg-[rgba(248,244,238,0.86)] px-4 py-2 text-sm text-[var(--text)] transition duration-300 hover:-translate-y-[1px]">
                        {item.imageDataUrl ? 'Replace photo' : 'Add photo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                              return;
                            }

                            try {
                              await onUploadPhoto(item.id, file);
                              setUploadError('');
                            } catch (uploadFailure) {
                              setUploadError(
                                uploadFailure instanceof Error
                                  ? uploadFailure.message
                                  : 'Unable to upload that wardrobe photo right now.',
                              );
                            }
                            event.target.value = '';
                          }}
                        />
                      </label>
                    </Panel>
                  </MotionCard>
                ))}
              </div>
            )}
          </Panel>

          <DemoWardrobeRack
            items={exampleItems}
            selectedIds={exampleSelection}
            existingIds={existingIds}
            onToggle={toggleExampleSelection}
            onAddSelected={handleAddSelectedExamples}
          />
        </div>
      </div>
    </div>
  );
}

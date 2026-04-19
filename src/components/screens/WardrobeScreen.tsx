import { useDeferredValue, useState } from 'react';
import type { MediaAsset, WardrobeItem } from '../../data/wearData';
import { cx } from '../../lib/cx';
import { ItemArtwork, MotionCard, Panel, SectionKicker, SurfaceBadge } from '../Chrome';
import { DemoWardrobeRack } from '../DemoWardrobeRack';
import { ScreenHeader } from './shared';

type Tab = 'closet' | 'uploads' | 'review';

function formatSourceLabel(item: WardrobeItem) {
  return { seed: 'Curated', example: 'Example', upload: 'Uploaded' }[item.source ?? 'seed'];
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
  if (item.detection?.state === 'reviewed') return 'accent';
  if (item.detection?.state === 'auto-detected' || item.detection?.state === 'curated') return 'accent-soft';
  return 'default';
}

export function WardrobeScreen({
  wardrobe,
  exampleItems,
  mediaAssets = [],
  onUploadPhoto,
  onUploadNewItem,
  onAddExampleItems,
  onCreateFromMedia,
  onDeleteMediaAsset: _onDeleteMediaAsset,
}: {
  wardrobe: WardrobeItem[];
  exampleItems: WardrobeItem[];
  mediaAssets?: MediaAsset[];
  onUploadPhoto: (itemId: string, file: File) => Promise<void>;
  onUploadNewItem: (file: File) => Promise<void>;
  onAddExampleItems: (itemIds: string[]) => void;
  onCreateFromMedia?: (mediaAssetId: string, targetItemId?: string | null) => Promise<void>;
  onDeleteMediaAsset?: (mediaAssetId: string) => Promise<void>;
}) {
  const [tab, setTab] = useState<Tab>('closet');
  const [query, setQuery] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [exampleSelection, setExampleSelection] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<'All' | 'Tops' | 'Bottoms' | 'Shoes' | 'Outerwear' | 'Accessories'>('All');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'mine' | 'example'>('all');

  const uploadedCount = wardrobe.filter((item) => Boolean(item.imageDataUrl || item.imageUrl)).length;
  const reviewItems = wardrobe.filter((item) => item.detection?.state === 'error' || item.detection?.state === 'auto-detected');
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
    if (nextIds.length === 0) return;
    onAddExampleItems(nextIds);
    setExampleSelection([]);
    setUploadError('');
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'closet', label: 'Closet', count: wardrobe.length },
    { key: 'uploads', label: 'Uploads', count: mediaAssets.length },
    { key: 'review', label: 'Review queue', count: reviewItems.length },
  ];

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Wardrobe"
        title="Closet builder"
        description="Map, upload, and review your pieces."
        action={
          <div className="flex flex-wrap gap-3">
            <SurfaceBadge tone="accent-soft">{uploadedCount}/{wardrobe.length} photos mapped</SurfaceBadge>
            <SurfaceBadge tone="accent">Wardrobe-first</SurfaceBadge>
          </div>
        }
      />

      {/* Tab bar */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto border-b pb-4" style={{ borderColor: 'var(--line)' }}>
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cx(
              'rounded-full border px-5 py-2.5 text-sm font-medium transition duration-300',
              tab === key
                ? 'border-[rgba(143,150,255,0.34)] bg-[rgba(143,150,255,0.12)] text-[var(--text)]'
                : 'border-[rgba(24,24,29,0.08)] text-[var(--muted)] hover:-translate-y-[1px]',
            )}
            style={tab !== key ? { background: 'var(--surface)' } : undefined}
          >
            {label}
            {count !== undefined && count > 0 ? (
              <span className={cx(
                'ml-2 rounded-full px-2 py-0.5 text-xs',
                tab === key ? 'bg-[rgba(143,150,255,0.2)] text-[var(--text)]' : 'bg-[rgba(24,24,29,0.06)] text-[var(--muted)]',
              )}>
                {count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === 'closet' ? (
        <div className="grid gap-6 xl:grid-cols-[0.32fr_0.68fr]">
          {/* Filters + quick add */}
          <div className="space-y-6">
            <Panel className="p-5" variant="solid">
              <SectionKicker>Filters</SectionKicker>
              <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
                {(['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={cx(
                      'rounded-full border px-4 py-2 text-sm transition duration-300',
                      category === item
                        ? 'border-[rgba(143,150,255,0.34)] bg-[rgba(143,150,255,0.12)] text-[var(--text)]'
                        : 'border-[rgba(24,24,29,0.08)] text-[var(--muted)]',
                    )}
                    style={category !== item ? { background: 'var(--surface)' } : undefined}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-strong)]">Source</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {([
                    { key: 'all', label: `All (${wardrobe.length})` },
                    { key: 'mine', label: `Mine (${myItemCount})` },
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
                          : 'border-[rgba(24,24,29,0.08)] text-[var(--muted)]',
                      )}
                      style={sourceFilter !== key ? { background: 'var(--surface)' } : undefined}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="mt-5 block">
                <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted-strong)]">Search</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Piece, tag, or material"
                  className="field-input mt-2"
                />
              </label>
            </Panel>

            <Panel className="p-5" variant="soft">
              <SectionKicker>Add pieces</SectionKicker>
              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[20px] px-4 py-4 text-sm transition duration-300 hover:-translate-y-[1px]" style={{ background: 'var(--surface-strong)' }}>
                  <div>
                    <p className="text-[0.98rem] text-[var(--text)]">Upload new photo</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">Auto-detect category, color, fit.</p>
                  </div>
                  <SurfaceBadge tone="accent">Review flow</SurfaceBadge>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      try {
                        await onUploadNewItem(file);
                        setUploadError('');
                      } catch (err) {
                        setUploadError(err instanceof Error ? err.message : 'Upload failed.');
                      }
                      event.target.value = '';
                    }}
                  />
                </label>

                {mediaAssets.length > 0 && onCreateFromMedia ? (
                  <button
                    type="button"
                    onClick={() => onCreateFromMedia(mediaAssets[0].id)}
                    className="flex w-full items-center justify-between gap-3 rounded-[20px] px-4 py-4 text-sm transition duration-300 hover:-translate-y-[1px]"
                    style={{ background: 'var(--surface-strong)' }}
                  >
                    <div className="text-left">
                      <p className="text-[0.98rem] text-[var(--text)]">From upload library</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{mediaAssets.length} photo{mediaAssets.length !== 1 ? 's' : ''} ready</p>
                    </div>
                    <SurfaceBadge tone="accent-soft">Library</SurfaceBadge>
                  </button>
                ) : null}

                {uploadError ? (
                  <p className="rounded-[16px] bg-[rgba(193,78,78,0.08)] px-4 py-3 text-sm text-[var(--danger)]">{uploadError}</p>
                ) : null}
              </div>
            </Panel>
          </div>

          {/* Item grid */}
          <div className="space-y-6">
            <Panel className="p-6 xl:p-8" variant="glass">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <SectionKicker>Mapped wardrobe</SectionKicker>
                  <p className="mt-3 text-[1.3rem] text-[var(--text)]">{filteredItems.length} pieces</p>
                </div>
                <SurfaceBadge tone="accent">Wardrobe-first engine</SurfaceBadge>
              </div>

              {filteredItems.length === 0 ? (
                <div className="mt-6 rounded-[22px] border border-dashed border-[rgba(24,24,29,0.14)] px-6 py-10 text-center text-sm text-[var(--muted)]" style={{ background: 'var(--surface)' }}>
                  No pieces match this filter.
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
                        <ItemArtwork palette={item.palette} imageUrl={item.imageUrl} imageDataUrl={item.imageDataUrl} label={item.status} />
                        <div className="mt-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[1rem] text-[var(--text)]">{item.name}</p>
                            <p className="mt-1 text-sm text-[var(--muted)]">{item.category} / {item.fit}</p>
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
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.tags.slice(0, 4).map((tag) => (
                            <SurfaceBadge key={tag}>{tag}</SurfaceBadge>
                          ))}
                        </div>
                        <label className="mt-4 inline-flex cursor-pointer items-center rounded-full border border-[rgba(24,24,29,0.08)] px-4 py-2 text-sm text-[var(--text)] transition duration-300 hover:-translate-y-[1px]" style={{ background: 'var(--surface-high)' }}>
                          {(item.imageDataUrl || item.imageUrl) ? 'Replace photo' : 'Add photo'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              try {
                                await onUploadPhoto(item.id, file);
                                setUploadError('');
                              } catch (err) {
                                setUploadError(err instanceof Error ? err.message : 'Upload failed.');
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
      ) : null}

      {tab === 'uploads' ? (
        <div className="space-y-4">
          {mediaAssets.length === 0 ? (
            <Panel className="px-6 py-14 text-center" variant="solid">
              <p className="text-[1.1rem] text-[var(--text)]">No uploads yet.</p>
              <p className="mt-3 text-sm text-[var(--muted)]">Upload a piece from the Closet tab to start building your library.</p>
            </Panel>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="section-kicker">{mediaAssets.length} assets in library</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {mediaAssets.map((asset) => (
                  <MotionCard key={asset.id}>
                    <Panel className="p-4" variant="solid">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[18px]">
                        <img src={asset.previewUrl} alt={asset.fileName} className="h-full w-full object-cover" />
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <SurfaceBadge tone={asset.linkedItemId ? 'accent' : 'default'}>
                            {asset.linkedItemId ? 'Linked' : 'Unlinked'}
                          </SurfaceBadge>
                          <SurfaceBadge>{asset.kind === 'generated-look' ? 'Generated' : 'Upload'}</SurfaceBadge>
                        </div>
                        <p className="truncate text-sm text-[var(--text)]">{asset.fileName}</p>
                        <p className="text-xs text-[var(--muted)]">{new Date(asset.createdAt).toLocaleDateString()}</p>
                        {!asset.linkedItemId && onCreateFromMedia ? (
                          <button
                            type="button"
                            onClick={() => onCreateFromMedia(asset.id)}
                            className="button-secondary mt-2 w-full text-xs"
                          >
                            Add to wardrobe
                          </button>
                        ) : null}
                      </div>
                    </Panel>
                  </MotionCard>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      {tab === 'review' ? (
        <div className="space-y-4">
          {reviewItems.length === 0 ? (
            <Panel className="px-6 py-14 text-center" variant="solid">
              <p className="text-[1.1rem] text-[var(--text)]">Review queue is clear.</p>
              <p className="mt-3 text-sm text-[var(--muted)]">All uploaded pieces have been reviewed or are curated.</p>
            </Panel>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {reviewItems.map((item) => (
                <MotionCard key={item.id}>
                  <Panel className="p-4" variant="solid">
                    <ItemArtwork palette={item.palette} imageUrl={item.imageUrl} imageDataUrl={item.imageDataUrl} label={item.status} />
                    <div className="mt-4">
                      <p className="text-[1rem] text-[var(--text)]">{item.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{item.category} / {item.color}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <SurfaceBadge tone={detectionTone(item)}>{formatDetectionLabel(item)}</SurfaceBadge>
                      {item.detection?.confidence ? (
                        <SurfaceBadge>{Math.round(item.detection.confidence * 100)}% confidence</SurfaceBadge>
                      ) : null}
                    </div>
                    {item.styleNote ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.styleNote}</p>
                    ) : null}
                    <label className="mt-4 inline-flex cursor-pointer items-center rounded-full border border-[rgba(24,24,29,0.08)] px-4 py-2 text-sm text-[var(--text)] transition hover:-translate-y-[1px]" style={{ background: 'var(--surface-high)' }}>
                      Confirm by replacing photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          await onUploadPhoto(item.id, file);
                          event.target.value = '';
                        }}
                      />
                    </label>
                  </Panel>
                </MotionCard>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

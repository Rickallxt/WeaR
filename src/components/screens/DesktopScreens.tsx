import { motion, useReducedMotion } from 'framer-motion';
import { useDeferredValue, useState } from 'react';
import type { ReactNode } from 'react';
import {
  alternateOutfits,
  colorTendencies,
  quickRefinements,
  savedCollections,
  styleLogic,
  todayOutfit,
  type OutfitSuggestion,
  type UserProfile,
  type WardrobeItem,
} from '../../data/wearData';
import { cx } from '../../lib/cx';
import { ItemArtwork, MetricCard, MotionCard, Panel, SectionKicker, SurfaceBadge, WardrobeMosaic } from '../Chrome';
import { DemoWardrobeRack } from '../DemoWardrobeRack';

function getWardrobeItemsForOutfit(wardrobe: WardrobeItem[], pieces: string[]) {
  return pieces
    .map((piece, index) => {
      const match = wardrobe.find((item) => item.name === piece);

      return (
        match ?? {
          id: `${piece}-${index}`,
          name: piece,
          palette: 'from-[#ece7df] via-[#fffaf4] to-[#dde4ff]',
          imageDataUrl: null,
          category: 'Accessories',
          fit: 'Unknown',
          material: 'Unknown',
          color: 'Neutral',
          tags: [],
          status: 'Core',
        }
      );
    })
    .slice(0, 4);
}

function buildDashboardMetrics(wardrobe: WardrobeItem[]) {
  const uploadedCount = wardrobe.filter((item) => Boolean(item.imageDataUrl)).length;
  const repeatCount = wardrobe.filter((item) => item.status === 'Repeat').length;
  const categoryCount = new Set(wardrobe.map((item) => item.category)).size;
  const uploadCoverage = wardrobe.length === 0 ? 0 : Math.round((uploadedCount / wardrobe.length) * 100);

  return [
    {
      label: 'Mapped pieces',
      value: String(wardrobe.length),
      detail: `${uploadedCount} wardrobe photos uploaded`,
    },
    {
      label: 'Photo coverage',
      value: `${uploadCoverage}%`,
      detail: 'Enough visual inventory for wardrobe-first generation',
    },
    {
      label: 'Repeat anchors',
      value: String(repeatCount),
      detail: 'Pieces already proving strongest in rotation',
    },
    {
      label: 'Ready categories',
      value: String(categoryCount),
      detail: 'Mapped across layers, bottoms, shoes, and finishes',
    },
  ];
}

function ScreenHeader({
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

function PieceList({ outfit }: { outfit: OutfitSuggestion }) {
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

export function DashboardScreen({
  profile,
  wardrobe,
}: {
  profile: UserProfile;
  wardrobe: WardrobeItem[];
}) {
  const reduceMotion = useReducedMotion();
  const todayWardrobe = getWardrobeItemsForOutfit(wardrobe, todayOutfit.pieces);
  const dashboardMetrics = buildDashboardMetrics(wardrobe);
  const uploadedCount = wardrobe.filter((item) => Boolean(item.imageDataUrl)).length;

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Home"
        title={`Good evening, ${profile.name}.`}
        description="Your dashboard keeps today's wardrobe-first outfit, alternate combinations, style logic, and saved looks in one premium flow."
        action={
          <div className="flex flex-wrap gap-3">
            <SurfaceBadge tone="accent-soft">{wardrobe.length} pieces mapped</SurfaceBadge>
            <SurfaceBadge>{uploadedCount} photos ready</SurfaceBadge>
            <SurfaceBadge tone="accent">Own wardrobe first</SurfaceBadge>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <MotionCard>
          <Panel className="relative overflow-hidden p-6 xl:p-8" variant="glass">
            <div className={cx('absolute inset-0 bg-gradient-to-br opacity-80', todayOutfit.palette)} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_40%)]" />
            <div className="relative grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
              <div>
                <SectionKicker>Today's recommendation</SectionKicker>
                <h2 className="mt-4 font-display text-[2.2rem] leading-[0.96] tracking-[-0.06em] text-[var(--text)] xl:text-[3rem]">
                  {todayOutfit.title}
                </h2>
                <p className="mt-4 text-[1rem] leading-8 text-[var(--text)]/80">{todayOutfit.vibe}</p>
                <p className="mt-6 max-w-[30rem] text-[0.98rem] leading-7 text-[var(--muted)]">{todayOutfit.note}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <SurfaceBadge tone="accent">Built from owned pieces</SurfaceBadge>
                  <SurfaceBadge>{profile.fitPreference} fit logic</SurfaceBadge>
                  <SurfaceBadge>{profile.occasions[0]}</SurfaceBadge>
                </div>
              </div>

              <div className="grid gap-4">
                <Panel className="p-4" variant="solid">
                  <WardrobeMosaic items={todayWardrobe} label="WeaR look" />
                </Panel>
                <PieceList outfit={todayOutfit} />
              </div>
            </div>
          </Panel>
        </MotionCard>

        <div className="grid gap-6">
          <Panel className="p-6" variant="solid">
            <SectionKicker>Fit intelligence</SectionKicker>
            <p className="mt-4 text-[1.1rem] leading-8 text-[var(--text)]">{todayOutfit.silhouette}</p>
            <div className="mt-6 space-y-3">
              {styleLogic.slice(0, 2).map((item) => (
                <div key={item} className="rounded-[20px] bg-[rgba(248,244,238,0.85)] px-4 py-4">
                  <p className="text-sm leading-7 text-[var(--muted)]">{item}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-6" variant="soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <SectionKicker>Saved looks</SectionKicker>
                <p className="mt-3 text-[1.15rem] text-[var(--text)]">Pinned for quick repeat</p>
              </div>
              <SurfaceBadge tone="accent-soft">{savedCollections.length} collections</SurfaceBadge>
            </div>
            <div className="mt-5 grid gap-3">
              {savedCollections.slice(0, 2).map((collection) => (
                <div key={collection.title} className="rounded-[22px] bg-white/84 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{collection.vibe}</p>
                  <p className="mt-2 text-[1.02rem] text-[var(--text)]">{collection.title}</p>
                  <p className="mt-3 text-sm text-[var(--muted)]">{collection.count} looks pinned</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardMetrics.map((item) => (
          <MetricCard key={item.label} value={item.value} label={item.label} detail={item.detail} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <Panel className="p-6 xl:p-8" variant="soft">
          <div className="flex items-center justify-between">
            <div>
              <SectionKicker>Alternates</SectionKicker>
              <p className="mt-4 text-[1.4rem] text-[var(--text)]">Same wardrobe, different energy</p>
            </div>
            <SurfaceBadge>3 ready swaps</SurfaceBadge>
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {alternateOutfits.map((outfit) => (
              <MotionCard key={outfit.id}>
                <Panel className="h-full p-4" variant="solid">
                  <WardrobeMosaic items={getWardrobeItemsForOutfit(wardrobe, outfit.pieces)} label={outfit.vibe} />
                  <p className="mt-4 text-[1rem] text-[var(--text)]">{outfit.title}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{outfit.note}</p>
                </Panel>
              </MotionCard>
            ))}
          </div>
        </Panel>

        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
          transition={reduceMotion ? undefined : { duration: 7, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        >
          <Panel className="p-6 xl:p-8" variant="glass">
            <SectionKicker>Wardrobe guidance</SectionKicker>
            <h3 className="mt-4 font-display text-[2rem] tracking-[-0.05em] text-[var(--text)]">
              Your wardrobe is already stronger than it looks.
            </h3>
            <div className="mt-6 space-y-4">
              {[
                'Outerwear is carrying the most polish per wear right now.',
                'You get the cleanest result when the base stays quiet and one detail adds lift.',
                'New shopping should stay secondary until the saved repeat formulas are exhausted.',
              ].map((item) => (
                <div key={item} className="rounded-[22px] border border-white/80 bg-white/84 px-4 py-4">
                  <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
                </div>
              ))}
            </div>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
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
  const uploadedCount = wardrobe.filter((item) => Boolean(item.imageDataUrl)).length;
  const existingIds = wardrobe.map((item) => item.id);

  const filteredItems = wardrobe.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    const haystack = `${item.name} ${item.category} ${item.tags.join(' ')} ${item.material}`.toLowerCase();
    const matchesQuery = haystack.includes(deferredQuery.trim().toLowerCase());
    return matchesCategory && matchesQuery;
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
                  <Panel className="h-full p-4" variant="solid">
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

export function StudioScreen({
  profile,
  wardrobe,
}: {
  profile: UserProfile;
  wardrobe: WardrobeItem[];
}) {
  const todayWardrobe = getWardrobeItemsForOutfit(wardrobe, todayOutfit.pieces);

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Outfit studio"
        title="Recommendations from your own wardrobe"
        description="Every combination here is generated from mapped pieces you already own, then refined through body-aware fit logic and occasion context."
        action={<SurfaceBadge tone="accent-soft">0 shopping prompts in primary flow</SurfaceBadge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel className="p-6 xl:p-8" variant="glass">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <SectionKicker>Current build</SectionKicker>
              <h2 className="mt-4 font-display text-[2.1rem] tracking-[-0.05em] text-[var(--text)]">
                {todayOutfit.title}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <SurfaceBadge tone="accent">{profile.fitPreference} fit</SurfaceBadge>
              <SurfaceBadge>{profile.occasions[0]}</SurfaceBadge>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <WardrobeMosaic items={todayWardrobe} label="Full look" />
            <div className="space-y-4">
              <PieceList outfit={todayOutfit} />
              <Panel className="p-5" variant="solid">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Why it works</p>
                <p className="mt-4 text-[1rem] leading-8 text-[var(--text)]">{todayOutfit.silhouette}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{todayOutfit.note}</p>
              </Panel>
            </div>
          </div>
        </Panel>

        <div className="grid gap-6">
          <Panel className="p-6" variant="solid">
            <SectionKicker>Refine this look</SectionKicker>
            <div className="mt-5 flex flex-wrap gap-3">
              {quickRefinements.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="rounded-full border border-[rgba(24,24,29,0.08)] bg-white/82 px-4 py-2.5 text-sm text-[var(--text)] transition duration-300 hover:-translate-y-[1px] hover:border-[rgba(143,150,255,0.3)]"
                >
                  {item}
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="p-6" variant="soft">
            <SectionKicker>Body-aware notes</SectionKicker>
            <div className="mt-5 space-y-3">
              {[
                'Keep the waist readable without tightening every piece.',
                'Use the bomber to sharpen the shoulder and frame the torso.',
                'The long trouser does more for your proportions than a louder shoe choice.',
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-white/82 px-4 py-4">
                  <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel className="p-6 xl:p-8" variant="soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <SectionKicker>Alternate combinations</SectionKicker>
            <p className="mt-4 text-[1.4rem] text-[var(--text)]">Same wardrobe, different styling energy</p>
          </div>
          <SurfaceBadge>Swap without shopping</SurfaceBadge>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {alternateOutfits.map((outfit) => (
            <MotionCard key={outfit.id}>
              <Panel className="h-full p-4" variant="solid">
                <WardrobeMosaic items={getWardrobeItemsForOutfit(wardrobe, outfit.pieces)} label={outfit.vibe} />
                <p className="mt-4 text-[1rem] text-[var(--text)]">{outfit.title}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{outfit.silhouette}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {outfit.pieces.slice(0, 2).map((piece) => (
                    <SurfaceBadge key={piece}>{piece}</SurfaceBadge>
                  ))}
                </div>
              </Panel>
            </MotionCard>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function ProfileScreen({ profile }: { profile: UserProfile }) {
  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Style profile"
        title="Fit intelligence"
        description="A premium readout of the body and taste signals WeaR uses to style your wardrobe more effectively."
        action={<SurfaceBadge tone="accent">Updated from onboarding</SurfaceBadge>}
      />

      <div className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <Panel className="p-6 xl:p-8" variant="glass">
          <SectionKicker>Measurements + preferences</SectionKicker>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['Height', `${profile.height} cm`],
              ['Weight', `${profile.weight} kg`],
              ['Shoulder line', profile.shoulderLine],
              ['Leg line', profile.legLine],
              ['Fit preference', profile.fitPreference],
              ['Styling path', profile.path],
            ].map(([label, value]) => (
              <Panel key={label} className="p-4" variant="solid">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
                <p className="mt-3 text-[1rem] text-[var(--text)]">{value}</p>
              </Panel>
            ))}
          </div>
        </Panel>

        <Panel className="p-6 xl:p-8" variant="soft">
          <SectionKicker>Favored silhouettes</SectionKicker>
          <div className="mt-5 space-y-4">
            {styleLogic.map((item) => (
              <div key={item} className="rounded-[22px] bg-white/82 px-4 py-4">
                <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel className="p-6 xl:p-8" variant="solid">
          <SectionKicker>Color tendencies</SectionKicker>
          <div className="mt-5 grid gap-3">
            {colorTendencies.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-[20px] bg-[rgba(248,244,238,0.82)] px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full border border-white/90" style={{ backgroundColor: item.hex }} />
                  <span className="text-sm text-[var(--text)]">{item.name}</span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{item.hex}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6 xl:p-8" variant="glass">
          <SectionKicker>Style taste</SectionKicker>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.stylePreferences.map((item) => (
              <SurfaceBadge key={item} tone="accent">
                {item}
              </SurfaceBadge>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Panel className="p-5" variant="solid">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Most flattering formula</p>
              <p className="mt-4 text-[1rem] leading-8 text-[var(--text)]">
                Structured outer layer, quieter base, longer trouser line, and one cleaner modern finish.
              </p>
            </Panel>
            <Panel className="p-5" variant="solid">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">What to avoid</p>
              <p className="mt-4 text-[1rem] leading-8 text-[var(--text)]">
                Too many loud details at once. Your wardrobe looks strongest when shape leads and accessories stay controlled.
              </p>
            </Panel>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function SavedLooksScreen({ wardrobe }: { wardrobe: WardrobeItem[] }) {
  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Saved looks"
        title="Collections and pins"
        description="Revisit the combinations that work best by vibe, season, and real-world use. Save the formulas that make your wardrobe easier to repeat."
        action={
          <div className="flex flex-wrap gap-3">
            <SurfaceBadge tone="accent-soft">{savedCollections.length} collections</SurfaceBadge>
            <SurfaceBadge tone="accent">Pinned for repeat wear</SurfaceBadge>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {savedCollections.map((collection) => (
          <MotionCard key={collection.title}>
            <Panel className="h-full p-5 xl:p-6" variant="glass">
              <WardrobeMosaic
                items={getWardrobeItemsForOutfit(wardrobe, collection.pins)}
                label={collection.vibe}
              />
              <div className="mt-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[1.05rem] text-[var(--text)]">{collection.title}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{collection.count} saved looks</p>
                </div>
                <SurfaceBadge tone="accent-soft">{collection.vibe}</SurfaceBadge>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {collection.pins.map((pin) => (
                  <SurfaceBadge key={pin}>{pin}</SurfaceBadge>
                ))}
              </div>
            </Panel>
          </MotionCard>
        ))}
      </div>

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

export function SettingsScreen({ profile }: { profile: UserProfile }) {
  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Settings"
        title="Profile and personalization"
        description="Account details, measurement edits, styling controls, and preference settings live here without making the product feel technical or heavy."
      />

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <Panel className="p-6 xl:p-8" variant="solid">
          <SectionKicker>Account</SectionKicker>
          <div className="mt-5 grid gap-4">
            {[
              ['Name', profile.name],
              ['Email', 'avery@wear.app'],
              ['Preferred path', profile.path],
              ['Primary fit mode', profile.fitPreference],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[20px] bg-[rgba(248,244,238,0.82)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
                <p className="mt-2 text-[1rem] text-[var(--text)]">{value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-6">
          <Panel className="p-6 xl:p-8" variant="glass">
            <SectionKicker>Personalization</SectionKicker>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ['Occasion-first recommendations', 'On'],
                ['Saved look reminders', 'Weekly'],
                ['New item prompts', 'Secondary'],
                ['Experimental styling', 'On'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] border border-white/80 bg-white/82 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
                  <p className="mt-3 text-[1rem] text-[var(--text)]">{value}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-6 xl:p-8" variant="soft">
            <SectionKicker>Wardrobe preferences</SectionKicker>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Hide shopping-first suggestions', 'Prioritize repeats', 'Save strongest silhouettes', 'Show occasion filters'].map((item) => (
                <SurfaceBadge key={item} tone="accent">
                  {item}
                </SurfaceBadge>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

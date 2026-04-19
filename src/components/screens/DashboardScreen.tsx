import { motion, useReducedMotion } from 'framer-motion';
import {
  alternateOutfits,
  savedCollections,
  todayOutfit,
  type MediaAsset,
  type UserProfile,
  type WardrobeItem,
} from '../../data/wearData';
import type { GenerationStatus } from '../../lib/generationApi';
import type { EventSession } from '../../lib/persistence';
import { MetricCard, MotionCard, Panel, SectionKicker, SurfaceBadge, WardrobeMosaic } from '../Chrome';
import { getWardrobeItemsForOutfit } from './wardrobeUtils';
import { PieceList } from './shared';

function buildDashboardMetrics(wardrobe: WardrobeItem[]) {
  const uploadedCount = wardrobe.filter((item) => Boolean(item.imageDataUrl || item.imageUrl)).length;
  const repeatCount = wardrobe.filter((item) => item.status === 'Repeat').length;
  const categoryCount = new Set(wardrobe.map((item) => item.category)).size;
  const uploadCoverage = wardrobe.length === 0 ? 0 : Math.round((uploadedCount / wardrobe.length) * 100);

  return [
    { label: 'Pieces mapped', value: String(wardrobe.length), detail: `${uploadedCount} with photos` },
    { label: 'Photo coverage', value: `${uploadCoverage}%`, detail: 'Visual inventory depth' },
    { label: 'Repeat anchors', value: String(repeatCount), detail: 'Strongest in rotation' },
    { label: 'Categories', value: String(categoryCount), detail: 'Layers, tops, shoes, finishes' },
  ];
}

function getWardrobeInsight(wardrobe: WardrobeItem[]): string {
  const uploadedCount = wardrobe.filter((item) => Boolean(item.imageDataUrl || item.imageUrl)).length;
  const totalCount = wardrobe.length;
  if (totalCount === 0) return 'Add pieces to unlock AI generation.';
  const coverage = Math.round((uploadedCount / totalCount) * 100);
  if (coverage < 50) return `${uploadedCount} of ${totalCount} pieces have photos — add more to strengthen generation.`;
  const cats = wardrobe.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});
  const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  return top ? `${top[0]} is your strongest mapped category with ${top[1]} pieces.` : 'Wardrobe is looking well mapped.';
}

export function DashboardScreen({
  profile,
  wardrobe,
  generationStatus,
  mediaAssets = [],
  eventSession,
  onGoGenerate,
  onGoWardrobe,
}: {
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  generationStatus: GenerationStatus | null;
  mediaAssets?: MediaAsset[];
  eventSession?: EventSession;
  onGoGenerate?: () => void;
  onGoWardrobe?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayWardrobe = getWardrobeItemsForOutfit(wardrobe, todayOutfit.pieces);
  const dashboardMetrics = buildDashboardMetrics(wardrobe);
  const wardrobeInsight = getWardrobeInsight(wardrobe);
  const uploadedCount = wardrobe.filter((item) => Boolean(item.imageDataUrl || item.imageUrl)).length;
  const aiTone = generationStatus?.connected ? 'live' : 'fallback';
  const aiLabel = generationStatus?.connected ? 'Local AI live' : 'Fallback mode';
  const hasSession = (eventSession?.messages.length ?? 0) > 1;
  const recentUploads = mediaAssets.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Home</p>
          <h1 className="font-display mt-4 text-[clamp(1.8rem,7vw,2.618rem)] leading-[0.94] tracking-[-0.06em] text-[var(--text)] xl:text-[4.236rem]">
            {greeting},<br />{profile.name}.
          </h1>
        </div>
        <div className="no-scrollbar flex flex-wrap items-center gap-3 overflow-x-auto sm:flex-wrap">
          <SurfaceBadge tone={aiTone}>{aiLabel}</SurfaceBadge>
          <SurfaceBadge tone="accent-soft">{wardrobe.length} pieces</SurfaceBadge>
          <SurfaceBadge>{uploadedCount} photos</SurfaceBadge>
          {hasSession && onGoGenerate ? (
            <button type="button" onClick={onGoGenerate} className="button-primary text-sm">
              Continue session →
            </button>
          ) : onGoGenerate ? (
            <button type="button" onClick={onGoGenerate} className="button-primary text-sm">
              Start a look →
            </button>
          ) : null}
          {onGoWardrobe ? (
            <button type="button" onClick={onGoWardrobe} className="button-secondary text-sm">
              Open wardrobe
            </button>
          ) : null}
        </div>
      </div>

      {/* Recent uploads strip */}
      {recentUploads.length > 0 ? (
        <Panel className="p-5" variant="solid">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionKicker>Upload library</SectionKicker>
              <p className="mt-2 text-sm text-[var(--muted)]">{mediaAssets.length} photo{mediaAssets.length !== 1 ? 's' : ''} ready to attach</p>
            </div>
            {onGoWardrobe ? (
              <button type="button" onClick={onGoWardrobe} className="button-secondary text-sm">
                Manage wardrobe
              </button>
            ) : null}
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {recentUploads.map((asset) => (
              <div
                key={asset.id}
                className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[14px] bg-[var(--surface)]"
                style={{ border: '1px solid var(--line)' }}
              >
                <img src={asset.previewUrl} alt={asset.fileName} className="h-full w-full object-cover" />
              </div>
            ))}
            {mediaAssets.length > 6 ? (
              <button
                type="button"
                onClick={onGoWardrobe}
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[14px] text-xs text-[var(--muted)] transition hover:-translate-y-[1px]"
                style={{ border: '1px solid var(--line)', background: 'var(--surface)' }}
              >
                +{mediaAssets.length - 6}
              </button>
            ) : null}
          </div>
        </Panel>
      ) : null}

      {/* Today's outfit + fit intelligence */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <MotionCard>
          <Panel className="relative overflow-hidden p-6 xl:p-8" variant="glass">
            <div className={`absolute inset-0 bg-gradient-to-br opacity-80 ${todayOutfit.palette}`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_40%)]" />
            <div className="relative grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
              <div>
                <SectionKicker>Today's look</SectionKicker>
                <h2 className="mt-4 font-display text-[1.618rem] leading-[1.2] tracking-[-0.05em] text-[var(--text)] xl:text-[2.618rem]">
                  {todayOutfit.title}
                </h2>
                <p className="mt-4 text-[1rem] leading-[1.618] text-[var(--text)]/80">{todayOutfit.vibe}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <SurfaceBadge tone="accent">From owned pieces</SurfaceBadge>
                  {profile.fitPreference ? <SurfaceBadge>{profile.fitPreference} fit</SurfaceBadge> : null}
                  {profile.occasions?.[0] ? <SurfaceBadge>{profile.occasions[0]}</SurfaceBadge> : null}
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
            <div className="flex items-center justify-between gap-3">
              <SectionKicker>Fit intelligence</SectionKicker>
              <SurfaceBadge tone={aiTone}>{generationStatus?.imageModel ?? 'Collage render'}</SurfaceBadge>
            </div>
            <p className="mt-4 text-[1rem] leading-[1.618] text-[var(--text)]">{todayOutfit.silhouette}</p>
            <div className="mt-5 space-y-3">
              {profile.fitPreference ? (
                <div className="rounded-[18px] px-4 py-3" style={{ background: 'var(--surface-high)' }}>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">Fit mode</p>
                  <p className="mt-2 text-sm text-[var(--text)]">{profile.fitPreference}</p>
                </div>
              ) : null}
              <div className="rounded-[18px] px-4 py-3" style={{ background: 'var(--surface-high)' }}>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">Wardrobe insight</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text)]">{wardrobeInsight}</p>
              </div>
            </div>
          </Panel>

          <Panel className="p-6" variant="soft">
            <div className="flex items-center justify-between gap-3">
              <SectionKicker>Saved looks</SectionKicker>
              <SurfaceBadge tone="accent-soft">{savedCollections.length} collections</SurfaceBadge>
            </div>
            <div className="mt-4 space-y-3">
              {savedCollections.slice(0, 2).map((collection) => (
                <div key={collection.title} className="rounded-[20px] p-4" style={{ background: 'var(--surface-strong)' }}>
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-strong)]">{collection.vibe}</p>
                  <p className="mt-2 text-[1rem] text-[var(--text)]">{collection.title}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{collection.count} looks pinned</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardMetrics.map((item) => (
          <MetricCard key={item.label} value={item.value} label={item.label} detail={item.detail} />
        ))}
      </div>

      {/* Alternates */}
      <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <Panel className="p-6 xl:p-8" variant="soft">
          <div className="flex items-center justify-between">
            <SectionKicker>Alternates</SectionKicker>
            <SurfaceBadge>3 ready swaps</SurfaceBadge>
          </div>
          <p className="mt-3 text-[1.1rem] text-[var(--text)]">Same wardrobe, different energy</p>
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {alternateOutfits.map((outfit) => (
              <MotionCard key={outfit.id}>
                <Panel className="h-full p-4" variant="solid">
                  <WardrobeMosaic items={getWardrobeItemsForOutfit(wardrobe, outfit.pieces)} label={outfit.vibe} />
                  <p className="mt-4 text-[1rem] text-[var(--text)]">{outfit.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{outfit.note}</p>
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
            <SectionKicker>Daily ritual</SectionKicker>
            <h3 className="font-display mt-4 text-[1.618rem] tracking-[-0.04em] text-[var(--text)] xl:text-[2rem]">
              WeaR is built for the morning check-in.
            </h3>
            <p className="mt-4 text-[1rem] leading-[1.618] text-[var(--muted)]">
              Tell it where you're going and it builds from what you own. No shopping prompts. No friction.
            </p>
            {onGoGenerate ? (
              <button type="button" onClick={onGoGenerate} className="button-primary mt-6 text-sm">
                {hasSession ? 'Continue your last session' : "What's the occasion?"}
              </button>
            ) : null}
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}

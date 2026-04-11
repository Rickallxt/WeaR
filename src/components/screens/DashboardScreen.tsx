import { motion, useReducedMotion } from 'framer-motion';
import {
  alternateOutfits,
  savedCollections,
  styleLogic,
  todayOutfit,
  type UserProfile,
  type WardrobeItem,
} from '../../data/wearData';
import { MetricCard, MotionCard, Panel, SectionKicker, SurfaceBadge, WardrobeMosaic } from '../Chrome';
import { getWardrobeItemsForOutfit } from './wardrobeUtils';
import { PieceList, ScreenHeader } from './shared';

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
            <div className={`absolute inset-0 bg-gradient-to-br opacity-80 ${todayOutfit.palette}`} />
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

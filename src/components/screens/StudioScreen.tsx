import {
  alternateOutfits,
  quickRefinements,
  todayOutfit,
  type UserProfile,
  type WardrobeItem,
} from '../../data/wearData';
import { MotionCard, Panel, SectionKicker, SurfaceBadge, WardrobeMosaic } from '../Chrome';
import { getWardrobeItemsForOutfit } from './wardrobeUtils';
import { PieceList, ScreenHeader } from './shared';

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
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-strong)]">Why it works</p>
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
                  className="rounded-full px-4 py-2.5 text-sm transition duration-300 hover:-translate-y-[1px]"
                  style={{ background: 'var(--surface-high)', color: 'var(--text)', border: '1px solid var(--line)', minHeight: 'var(--touch-target)' }}
                >
                  {item}
                </button>
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

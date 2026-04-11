import { alternateOutfits, savedCollections, todayOutfit, type WardrobeItem } from '../../data/wearData';
import { MotionCard, Panel, SectionKicker, SurfaceBadge, WardrobeMosaic } from '../Chrome';
import { getWardrobeItemsForOutfit } from './wardrobeUtils';
import { ScreenHeader } from './shared';

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

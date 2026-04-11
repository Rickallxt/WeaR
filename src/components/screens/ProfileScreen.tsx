import { colorTendencies, styleLogic, type UserProfile } from '../../data/wearData';
import { Panel, SectionKicker, SurfaceBadge } from '../Chrome';
import { ScreenHeader } from './shared';

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

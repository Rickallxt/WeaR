import type { UserProfile } from '../../data/wearData';
import { Panel, SectionKicker, SurfaceBadge } from '../Chrome';
import { ScreenHeader } from './shared';

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

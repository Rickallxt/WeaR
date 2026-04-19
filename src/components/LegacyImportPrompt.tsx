import { Panel, SectionKicker, SurfaceBadge } from './Chrome';

export function LegacyImportPrompt({
  wardrobeCount,
  collectionsCount,
  hasProfile,
  onImport,
  onSkip,
  loading,
}: {
  wardrobeCount: number;
  collectionsCount: number;
  hasProfile: boolean;
  onImport: () => Promise<void>;
  onSkip: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(17,18,23,0.18)] p-5 backdrop-blur-[18px]">
      <div className="w-full max-w-[46rem]">
        <Panel className="p-6 xl:p-8" variant="glass">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <SectionKicker>Import previous app data</SectionKicker>
              <h2 className="font-display mt-4 text-[2rem] leading-[0.96] tracking-[-0.06em] text-[var(--text)]">
                Bring your earlier WeaR setup into this account.
              </h2>
              <p className="mt-4 max-w-[34rem] text-[1rem] leading-[1.618] text-[var(--muted)]">
                We found local prototype data on this device. Import it once so your profile, wardrobe, and saved looks move into the new signed-in experience.
              </p>
            </div>
            <SurfaceBadge tone="accent-soft">One-time migration</SurfaceBadge>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Panel className="p-5" variant="solid">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">Profile</p>
              <p className="mt-3 text-[1.1rem] text-[var(--text)]">{hasProfile ? 'Ready to import' : 'No saved profile'}</p>
            </Panel>
            <Panel className="p-5" variant="solid">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">Wardrobe</p>
              <p className="mt-3 text-[1.1rem] text-[var(--text)]">{wardrobeCount} stored pieces</p>
            </Panel>
            <Panel className="p-5" variant="solid">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">Saved looks</p>
              <p className="mt-3 text-[1.1rem] text-[var(--text)]">{collectionsCount} collections</p>
            </Panel>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={onImport} className="button-primary text-sm" disabled={loading}>
              {loading ? 'Importing...' : 'Import into account'}
            </button>
            <button type="button" onClick={onSkip} className="button-secondary text-sm">
              Start fresh
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

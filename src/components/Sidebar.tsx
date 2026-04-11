import { navItems, type ScreenKey, type UserProfile } from '../data/wearData';
import { cx } from '../lib/cx';
import { AppGlyph, Panel, SurfaceBadge, WindowDots } from './Chrome';

export function Sidebar({
  activeScreen,
  onSelect,
  profile,
}: {
  activeScreen: ScreenKey;
  onSelect: (screen: ScreenKey) => void;
  profile: UserProfile;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/70 p-4 lg:w-[284px] lg:border-b-0 lg:border-r lg:p-5">
      <div className="flex items-center justify-between">
        <WindowDots />
        <SurfaceBadge tone="accent-soft">Desktop app</SurfaceBadge>
      </div>

      <div className="mt-8">
        <p className="font-display text-[2.2rem] tracking-[-0.08em] text-[var(--text)]">WeaR</p>
        <p className="mt-3 max-w-[15rem] text-sm leading-6 text-[var(--muted)]">
          Personal styling intelligence built from the wardrobe already in your closet.
        </p>
      </div>

      <nav className="mt-8 grid gap-2">
        {navItems.map((item) => {
          const active = item.key === activeScreen;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={cx(
                'flex items-center gap-4 rounded-[22px] px-4 py-4 text-left transition duration-300',
                active
                  ? 'bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.62))] shadow-[0_16px_42px_rgba(17,18,23,0.08)]'
                  : 'bg-transparent hover:bg-white/52',
              )}
            >
              <div
                className={cx(
                  'flex h-11 w-11 items-center justify-center rounded-[16px] border',
                  active
                    ? 'border-[rgba(143,150,255,0.28)] bg-[rgba(143,150,255,0.14)]'
                    : 'border-[rgba(24,24,29,0.08)] bg-white/72',
                )}
              >
                <AppGlyph name={item.icon} active={active} />
              </div>

              <div>
                <p className={cx('text-[0.98rem]', active ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                  {item.label}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{item.caption}</p>
              </div>
            </button>
          );
        })}
      </nav>

      <Panel className="mt-auto p-5" variant="solid">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Current styling profile</p>
        <p className="mt-4 text-xl text-[var(--text)]">{profile.name}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <SurfaceBadge>{profile.path}</SurfaceBadge>
          <SurfaceBadge tone="accent">{profile.fitPreference}</SurfaceBadge>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          {profile.stylePreferences.slice(0, 2).join(' / ')} with a wardrobe-first recommendation engine.
        </p>
      </Panel>
    </aside>
  );
}

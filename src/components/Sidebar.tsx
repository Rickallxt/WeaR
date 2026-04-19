import { navItems, type ScreenKey, type UserProfile } from '../data/wearData';
import { cx } from '../lib/cx';
import { AppGlyph, Panel, SurfaceBadge, WindowDots } from './Chrome';

export function Sidebar({
  activeScreen,
  onSelect,
  profile,
  onOpenPalette,
}: {
  activeScreen: ScreenKey;
  onSelect: (screen: ScreenKey) => void;
  profile: UserProfile;
  onOpenPalette?: () => void;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b p-4 lg:w-[284px] lg:border-b-0 lg:p-5" style={{ borderColor: 'var(--line)' }}>
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
                  ? 'shadow-[0_16px_42px_rgba(17,18,23,0.08)]'
                  : 'bg-transparent hover:bg-[var(--surface-high)]',
              )}
            style={active ? { background: 'var(--surface-highest)' } : undefined}
            >
              <div
                className={cx(
                  'flex h-11 w-11 items-center justify-center rounded-[16px] border',
                  active
                    ? 'border-[rgba(143,150,255,0.28)] bg-[rgba(143,150,255,0.14)]'
                    : 'border-[rgba(73,68,84,0.3)]',
                )}
                style={!active ? { background: 'var(--surface)' } : undefined}
              >
                <AppGlyph name={item.icon} active={active} />
              </div>

              <div>
                <p className={cx('text-[0.98rem]', active ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                  {item.label}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">{item.caption}</p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Command palette shortcut */}
      {onOpenPalette ? (
        <button
          type="button"
          onClick={onOpenPalette}
          className="mt-4 flex items-center justify-between rounded-[18px] px-4 py-3 transition-colors hover:bg-[var(--surface-high)]"
          style={{ border: '1px solid var(--line)' }}
          title="Open command palette (Ctrl+K)"
        >
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Command palette</span>
          <kbd
            className="flex items-center gap-1 rounded-[8px] border px-2 py-1 text-[0.6rem] font-medium"
            style={{ borderColor: 'var(--line)', color: 'var(--muted)', background: 'var(--surface)' }}
          >
            ⌘K
          </kbd>
        </button>
      ) : null}

      <Panel className="mt-4 p-5" variant="solid">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-strong)]">Current styling profile</p>
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

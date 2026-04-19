import { MaterialIcon } from '../Chrome';
import { type ScreenKey } from '../../data/wearData';

function triggerHaptic() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Haptics = (window as any).Capacitor?.Plugins?.Haptics;
    if (Haptics) {
      void Haptics.impact({ style: 'LIGHT' });
    }
  } catch {
    /* ignore — not in native context */
  }
}

/* 4 tabs — "Style" is the hero action */
const TABS = [
  {
    screen: 'dashboard' as ScreenKey,
    icon: 'home',
    label: 'Home',
    activeScreens: ['dashboard'] as ScreenKey[],
    hero: false,
  },
  {
    screen: 'generate' as ScreenKey,
    icon: 'auto_awesome',
    label: 'Style',
    activeScreens: ['generate', 'studio'] as ScreenKey[],
    hero: true,
  },
  {
    screen: 'wardrobe' as ScreenKey,
    icon: 'checkroom',
    label: 'Closet',
    activeScreens: ['wardrobe'] as ScreenKey[],
    hero: false,
  },
  {
    screen: 'profile' as ScreenKey,
    icon: 'person',
    label: 'Me',
    activeScreens: ['profile', 'saved', 'settings'] as ScreenKey[],
    hero: false,
  },
];

export function BottomTabBar({
  activeScreen,
  onSelect,
}: {
  activeScreen: ScreenKey;
  onSelect: (screen: ScreenKey) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex items-end justify-around px-2"
      style={{
        paddingTop: '0.75rem',
        paddingBottom: 'max(calc(var(--safe-bottom) + 0.5rem), 1.75rem)',
        background: 'rgba(14,14,14,0.82)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderTop: '1px solid rgba(73,68,84,0.18)',
      }}
      aria-label="Main navigation"
    >
      {TABS.map((tab) => {
        const isActive = tab.activeScreens.includes(activeScreen);

        if (tab.hero) {
          /* ── Hero "Style" tab ── */
          return (
            <button
              key={tab.screen}
              type="button"
              onClick={() => { triggerHaptic(); onSelect(tab.screen); }}
              className="flex flex-col items-center justify-center transition-all duration-300 active:scale-95"
              style={{ minWidth: '4.5rem' }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className="flex items-center justify-center rounded-2xl transition-all duration-300"
                style={{
                  width: '3.25rem',
                  height: '2.25rem',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(79,219,200,0.25), rgba(79,219,200,0.12))'
                    : 'rgba(73,68,84,0.18)',
                  border: isActive
                    ? '1px solid rgba(79,219,200,0.4)'
                    : '1px solid rgba(73,68,84,0.2)',
                  boxShadow: isActive ? '0 0 16px rgba(79,219,200,0.2)' : 'none',
                }}
              >
                <MaterialIcon
                  name={tab.icon}
                  filled={isActive}
                  size={22}
                  style={{ color: isActive ? '#4fdbc8' : '#958ea0' }}
                />
              </div>
              <span
                className="mt-1.5 font-semibold uppercase"
                style={{
                  fontSize: '0.625rem',
                  letterSpacing: '0.1em',
                  color: isActive ? '#4fdbc8' : '#6b6478',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        }

        /* ── Regular tab ── */
        return (
          <button
            key={tab.screen}
            type="button"
            onClick={() => { triggerHaptic(); onSelect(tab.screen); }}
            className="flex flex-col items-center justify-center transition-all duration-200 active:scale-95"
            style={{ minWidth: '3.5rem' }}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div
              className="flex items-center justify-center transition-all duration-200"
              style={{ width: '2.25rem', height: '2.25rem' }}
            >
              <MaterialIcon
                name={tab.icon}
                filled={isActive}
                size={24}
                style={{ color: isActive ? '#d0bcff' : '#6b6478' }}
              />
            </div>
            <span
              className="mt-1 font-medium uppercase"
              style={{
                fontSize: '0.625rem',
                letterSpacing: '0.08em',
                color: isActive ? '#d0bcff' : '#6b6478',
                fontFamily: 'var(--font-body)',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

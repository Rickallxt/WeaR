import { MaterialIcon } from '../Chrome';
import { type ScreenKey } from '../../data/wearData';

function triggerHaptic() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Haptics = (window as any).Capacitor?.Plugins?.Haptics;
    if (Haptics) void Haptics.impact({ style: 'LIGHT' });
  } catch { /* ignore */ }
}

/* 2 surfaces only — chat remains the hero action while wardrobe stays one tap away. */
const TABS = [
  {
    screen: 'wardrobe' as ScreenKey,
    icon: 'checkroom',
    label: 'Wardrobe',
    activeScreens: ['wardrobe'] as ScreenKey[],
    hero:          false,
  },
  {
    screen: 'chat' as ScreenKey,
    icon: 'auto_awesome',
    label: 'Chat',
    activeScreens: ['chat', 'generate', 'studio', 'dashboard'] as ScreenKey[],
    hero: true,
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
      className="fixed bottom-0 left-0 z-50 flex w-full items-end justify-center px-5"
      style={{
        paddingTop:    '0.75rem',
        paddingBottom: 'max(calc(var(--safe-bottom, 0px) + 0.5rem), 1.75rem)',
        background:    'rgba(13,13,13,0.86)',
        backdropFilter:         'blur(36px)',
        WebkitBackdropFilter:   'blur(36px)',
        borderTop: '1px solid rgba(73,68,84,0.16)',
      }}
      aria-label="Main navigation"
    >
      <div
        className="grid w-full max-w-[24rem] grid-cols-2 gap-3 rounded-[1.75rem] px-3 py-3"
        style={{
          background: 'rgba(20,19,25,0.92)',
          border: '1px solid rgba(73,68,84,0.22)',
          boxShadow: '0 18px 50px rgba(0,0,0,0.34)',
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.activeScreens.includes(activeScreen);
          const accent = tab.hero ? '#4fdbc8' : '#d0bcff';

          return (
            <button
              key={tab.screen}
              type="button"
              onClick={() => { triggerHaptic(); onSelect(tab.screen); }}
              className="flex items-center justify-center gap-2 rounded-[1.25rem] px-4 py-3 transition-all duration-300 active:scale-95"
              style={{
                minHeight: '3rem',
                background: isActive
                  ? tab.hero
                    ? 'linear-gradient(135deg, rgba(79,219,200,0.24), rgba(121,121,255,0.14))'
                    : 'linear-gradient(135deg, rgba(208,188,255,0.18), rgba(208,188,255,0.08))'
                  : 'rgba(255,255,255,0.03)',
                border: isActive
                  ? `1px solid ${tab.hero ? 'rgba(79,219,200,0.32)' : 'rgba(208,188,255,0.28)'}`
                  : '1px solid rgba(73,68,84,0.18)',
                boxShadow: isActive ? `0 0 20px ${tab.hero ? 'rgba(79,219,200,0.18)' : 'rgba(208,188,255,0.16)'}` : 'none',
              }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <MaterialIcon
                name={tab.icon}
                filled={isActive}
                size={tab.hero ? 24 : 22}
                style={{ color: isActive ? accent : '#8e8797' }}
              />
              <span
                className="font-semibold uppercase"
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  color: isActive ? accent : '#8e8797',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

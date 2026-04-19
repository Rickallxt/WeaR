import type { ReactNode } from 'react';
import { MaterialIcon } from '../Chrome';

export function MobileHeader({
  title,
  trailing,
  onMenuPress,
  userAvatarUrl,
}: {
  title?: string;
  trailing?: ReactNode;
  onMenuPress?: () => void;
  userAvatarUrl?: string | null;
}) {
  return (
    <header
      className="fixed top-0 inset-x-0 z-50"
      style={{
        background: '#131313',
        paddingTop: 'var(--safe-top, 0px)',
      }}
    >
      <div className="flex justify-between items-center px-6 h-16 max-w-screen-xl mx-auto">
        {/* Left: menu icon */}
        <button
          type="button"
          onClick={onMenuPress}
          className="transition-opacity hover:opacity-80"
          style={{ color: '#cbc3d7', minWidth: '2.5rem', minHeight: '2.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Menu"
        >
          <MaterialIcon name="menu" size={24} />
        </button>

        {/* Center: WeaR logo */}
        <h1
          className="text-xl font-bold tracking-tighter"
          style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}
        >
          {title ?? 'WeaR'}
        </h1>

        {/* Right: user avatar */}
        <div
          className="overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '9999px',
            background: '#353534',
            border: '1px solid rgba(73,68,84,0.3)',
          }}
          aria-label="Profile"
        >
          {userAvatarUrl ? (
            <img src={userAvatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <MaterialIcon name="person" size={20} className="text-[#cbc3d7]" />
          )}
        </div>
      </div>

      {/* Optional trailing slot below the header bar */}
      {trailing ? (
        <div className="px-6 pb-3">{trailing}</div>
      ) : null}
    </header>
  );
}

import { useEffect, useState } from 'react';

function checkIsNative(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cap = (window as any).Capacitor;
    return Boolean(cap?.isNativePlatform?.());
  } catch {
    return false;
  }
}

function checkIsMobile(): boolean {
  if (checkIsNative()) return true;
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

/**
 * Returns true when rendering inside a native Capacitor shell OR on a narrow
 * browser viewport (< 768px). Both cases use the mobile bottom-tab layout.
 */
export function useMobileLayout(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(checkIsMobile);

  useEffect(() => {
    if (checkIsNative()) return;

    const mql = window.matchMedia('(max-width: 767px)');

    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

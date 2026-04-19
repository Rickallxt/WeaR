import { useEffect, useState } from 'react';

/**
 * Tracks the visible viewport height on Android/mobile to handle the soft keyboard
 * pushing content up. Returns the visible height in px (or window.innerHeight if
 * the Keyboard plugin / VisualViewport API is not available).
 */
export function useAndroidKeyboard(): { visibleHeight: number; keyboardOpen: boolean } {
  const [visibleHeight, setVisibleHeight] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 0,
  );
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    // Prefer VisualViewport API (available in Chrome for Android)
    if (typeof window === 'undefined') return;

    const vv = window.visualViewport;

    function update() {
      const h = vv ? vv.height : window.innerHeight;
      setVisibleHeight(h);
      setKeyboardOpen(h < window.innerHeight * 0.85);
    }

    if (vv) {
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
    } else {
      window.addEventListener('resize', update);
    }

    update();

    return () => {
      if (vv) {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      } else {
        window.removeEventListener('resize', update);
      }
    };
  }, []);

  return { visibleHeight, keyboardOpen };
}

/**
 * PresentationStage — renders the app inside a decorative S25 Ultra phone frame
 * for live-demo / event presentation use.
 *
 * Key trick: the phone "screen" div carries `transform: translateZ(0)` which,
 * per the CSS Transforms spec, makes it the containing block for any
 * `position: fixed` descendants. So BottomTabBar, MobileHeader, modals, etc.
 * all stay correctly clipped inside the phone bezel. No iframe needed — mouse
 * events reach React components natively.
 */

import { type ReactNode, useEffect, useState } from 'react';

/* Helper: add -webkit-app-region to an inline style object safely */
function region(r: 'drag' | 'no-drag'): React.CSSProperties {
  return { WebkitAppRegion: r } as React.CSSProperties;
}

export function PresentationStage({ children }: { children: ReactNode }) {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  /* ── Device + screen dimensions ──────────────────────────────── */
  const W_DEVICE  = 370;   // phone shell width
  const H_DEVICE  = 756;   // phone shell height
  const BEZEL_H   = 10;    // top/bottom bezel inside screen
  const BEZEL_V   = 8;     // left/right bezel inside screen
  const R_DEVICE  = 48;    // device corner radius
  const R_SCREEN  = 40;    // screen corner radius

  const W_SCREEN  = W_DEVICE - BEZEL_V * 2;   // 354
  const H_SCREEN  = H_DEVICE - BEZEL_H * 2;   // 736

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#06060a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        userSelect: 'none',
        ...region('drag'),
      }}
    >
      {/* ── CSS keyframes (only way to define them in React inline styles) ── */}
      <style>{`
        @keyframes ps-bloom1 {
          from { transform: translate(0,0) scale(1);      opacity: .8; }
          to   { transform: translate(80px,40px) scale(1.12); opacity: 1; }
        }
        @keyframes ps-bloom2 {
          from { transform: translate(0,0) scale(1);       opacity: .7; }
          to   { transform: translate(-60px,-40px) scale(1.1); opacity: 1; }
        }
        @keyframes ps-float {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-6px); }
        }
        @keyframes ps-blink {
          0%,100% { opacity: 1; } 50% { opacity: .3; }
        }
        @keyframes ps-pulse {
          0%,100% { opacity: .7; transform: translate(-50%,-50%) scale(1);    }
          50%     { opacity: 1;  transform: translate(-50%,-50%) scale(1.06); }
        }
      `}</style>

      {/* ── Ambient blobs ──────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: 800, height: 640,
          top: -160, left: -160, borderRadius: '50%',
          background: 'radial-gradient(ellipse at center,rgba(110,70,220,.18) 0%,rgba(79,219,200,.06) 50%,transparent 70%)',
          filter: 'blur(60px)',
          animation: 'ps-bloom1 14s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', width: 720, height: 560,
          bottom: -140, right: -140, borderRadius: '50%',
          background: 'radial-gradient(ellipse at center,rgba(79,219,200,.14) 0%,rgba(160,100,255,.07) 50%,transparent 70%)',
          filter: 'blur(60px)',
          animation: 'ps-bloom2 18s ease-in-out infinite alternate',
        }} />
      </div>

      {/* ── Centre glow ────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center,rgba(208,188,255,.12) 0%,rgba(79,219,200,.05) 45%,transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        animation: 'ps-pulse 8s ease-in-out infinite',
      }} />

      {/* ── Dot grid ───────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)',
      }} />

      {/* ── Window top-bar (drag area + close button) ──────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', zIndex: 200,
      }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.12)' }}>
          WeaR Preview
        </span>
        <button
          type="button"
          onClick={() => window.close()}
          style={{
            width: 13, height: 13, borderRadius: '50%',
            background: '#3a3840', border: 'none', cursor: 'default',
            transition: 'background .15s',
            ...region('no-drag'),
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ff5f57'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#3a3840'; }}
          title="Close"
        />
      </div>

      {/* ── Stage content ──────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Brand header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14, ...region('no-drag') }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            borderRadius: 999, padding: '4px 12px',
            fontSize: 9, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase',
            color: '#4fdbc8', background: 'rgba(79,219,200,.1)', border: '1px solid rgba(79,219,200,.25)',
            marginBottom: 10,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4fdbc8', display: 'inline-block', animation: 'ps-blink 2.5s ease-in-out infinite' }} />
            Live Demo
          </div>
          <div style={{
            fontSize: 46, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1,
            background: 'linear-gradient(135deg,#e8e0ff 0%,#d0bcff 40%,#a07cff 70%,#4fdbc8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            WeaR
          </div>
          <div style={{ marginTop: 7, fontSize: 11, fontWeight: 400, color: 'rgba(203,195,215,.4)', letterSpacing: '.04em' }}>
            Your AI personal stylist — always in your pocket
          </div>
        </div>

        {/* ── Phone device ───────────────────────────────────────────── */}
        <div style={{ position: 'relative', flexShrink: 0, animation: 'ps-float 7s ease-in-out infinite', ...region('no-drag') }}>

          {/* Device shell */}
          <div style={{
            width: W_DEVICE, height: H_DEVICE,
            borderRadius: R_DEVICE,
            background: 'linear-gradient(168deg,#1e1c22 0%,#131118 30%,#100f13 55%,#181519 80%,#1d1b20 100%)',
            boxShadow: [
              'inset 1px 1px 0 rgba(255,255,255,.10)',
              'inset -1px 0 0 rgba(255,255,255,.03)',
              'inset 0 -1px 0 rgba(255,255,255,.05)',
              '0 0 0 1px rgba(0,0,0,.9)',
              '0 0 70px rgba(160,100,255,.20)',
              '0 0 140px rgba(79,219,200,.07)',
              '0 36px 100px rgba(0,0,0,.9)',
            ].join(','),
            position: 'relative',
          }}>
            {/* Glass sheen */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: R_DEVICE, pointerEvents: 'none',
              background: 'linear-gradient(128deg,rgba(240,234,228,.09) 0%,rgba(160,155,150,.02) 28%,transparent 50%,rgba(180,175,170,.03) 82%,rgba(230,224,218,.08) 100%)',
            }} />

            {/* ══════════════════════════════════════════════════════════
             *  SCREEN AREA
             *  transform: translateZ(0) makes this div the containing
             *  block for ALL position:fixed descendants, so BottomTabBar,
             *  MobileHeader, modals etc. stay inside the phone bezel.
             * ══════════════════════════════════════════════════════════ */}
            <div style={{
              position: 'absolute',
              top: BEZEL_H, left: BEZEL_V, right: BEZEL_V, bottom: BEZEL_H,
              width: W_SCREEN, height: H_SCREEN,
              borderRadius: R_SCREEN,
              overflow: 'hidden',
              background: '#000',
              boxShadow: `inset 0 0 0 .5px rgba(255,255,255,.07)`,
              /* *** THE FIX: makes this the containing block for position:fixed *** */
              transform: 'translateZ(0)',
            }}>
              {/* ── App content ── */}
              {children}

              {/* Screen fades (pointer-events: none, above the app) */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, background: 'linear-gradient(180deg,rgba(0,0,0,.3) 0%,transparent 100%)', zIndex: 15, pointerEvents: 'none', borderRadius: `${R_SCREEN}px ${R_SCREEN}px 0 0` }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(0deg,rgba(0,0,0,.28) 0%,transparent 100%)', zIndex: 15, pointerEvents: 'none', borderRadius: `0 0 ${R_SCREEN}px ${R_SCREEN}px` }} />

              {/* Status bar (pointer-events: none) */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 0 22px', zIndex: 20, pointerEvents: 'none' }}>
                <span style={{ fontFamily: 'system-ui,-apple-system,sans-serif', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.92)', letterSpacing: '.01em' }}>
                  {time}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {/* Signal */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 9 }}>
                    {([3, 5, 7, 9] as number[]).map((h, i) => (
                      <span key={i} style={{ display: 'block', width: 2.5, height: h, background: 'rgba(255,255,255,.88)', borderRadius: 1 }} />
                    ))}
                  </div>
                  {/* Battery */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: 20, height: 9.5, border: '1.5px solid rgba(255,255,255,.72)', borderRadius: 2, padding: 1.5, display: 'flex' }}>
                      <div style={{ width: '72%', height: '100%', background: 'rgba(255,255,255,.84)', borderRadius: 1 }} />
                    </div>
                    <div style={{ width: 2, height: 4.5, background: 'rgba(255,255,255,.55)', borderRadius: '0 1px 1px 0' }} />
                  </div>
                </div>
              </div>

              {/* Home indicator */}
              <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 100, height: 3, background: 'rgba(255,255,255,.24)', borderRadius: 2, zIndex: 20, pointerEvents: 'none' }} />
            </div>

            {/* Camera hole */}
            <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 11, height: 11, background: '#020102', borderRadius: '50%', zIndex: 30, boxShadow: '0 0 0 1.5px rgba(0,0,0,.95),inset 0 0 3px rgba(0,0,0,.9)' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 5, height: 5, background: 'radial-gradient(circle at 32% 32%,#1e243a,#050408)', borderRadius: '50%' }} />
            </div>

            {/* Side buttons */}
            {([
              { top: 185, h: 52 },
              { top: 248, h: 52 },
              { top: 350, h: 74 },
            ] as Array<{top: number; h: number}>).map((btn, i) => (
              <div key={i} style={{ position: 'absolute', right: -3, top: btn.top, width: 4, height: btn.h, background: 'linear-gradient(90deg,#161418,#211f23)', borderRadius: '0 3px 3px 0', boxShadow: '2px 0 4px rgba(0,0,0,.75)' }} />
            ))}

            {/* Bottom ports */}
            <div style={{ position: 'absolute', bottom: 4, left: 11, width: 4, height: 5.5, background: '#080808', borderRadius: '1px 1px 2.5px 2.5px' }} />
            <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 28, height: 5.5, background: '#090808', borderRadius: 3 }} />

            {/* Speaker grilles */}
            {[{ side: 'left', pos: { left: 52 } }, { side: 'right', pos: { right: 52 } }].map(({ side, pos }) => (
              <div key={side} style={{ position: 'absolute', bottom: 5, display: 'flex', gap: 2, alignItems: 'center', ...pos }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ display: 'block', width: 2, height: 4.5, background: '#0c0b0e', borderRadius: 1.5 }} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats caption ──────────────────────────────────────────── */}
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 18, ...region('no-drag') }}>
          {[
            { value: 'Zero UI', label: 'Outfit on open' },
            null,
            { value: 'Tap · Swipe', label: 'Refine in seconds' },
            null,
            { value: 'AI-first', label: 'Wardrobe concierge' },
          ].map((item, i) =>
            item === null ? (
              <div key={i} style={{ width: 1, height: 22, background: 'rgba(203,195,215,.1)' }} />
            ) : (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{
                  fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg,#d0bcff,#4fdbc8)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {item.value}
                </span>
                <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(203,195,215,.32)' }}>
                  {item.label}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

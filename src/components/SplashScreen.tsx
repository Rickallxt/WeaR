import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/* Luminous Obsidian palette — lavender + teal on deep obsidian */
const loaderPaths = [
  {
    size: 148,
    color: 'rgba(160, 120, 255, 0.85)',     /* accent-container purple */
    glow: '0 28px 56px rgba(208,188,255,0.22)',
    x: [0, 54, 102, 82, 18, -70, -116, -80, -18, 58, 118, 0],
    y: [-108, -72, -10, 70, 116, 84, 10, -70, -118, -90, -24, -108],
    delay: 0,
  },
  {
    size: 92,
    color: 'rgba(79, 219, 200, 0.75)',       /* accent-2 teal */
    glow: '0 22px 42px rgba(79,219,200,0.18)',
    x: [14, 58, 84, 50, -8, -62, -88, -48, 20, 62, 92, 14],
    y: [-64, -26, 26, 68, 88, 58, 6, -52, -82, -52, -8, -64],
    delay: 0.22,
  },
  {
    size: 58,
    color: 'rgba(208, 188, 255, 0.9)',       /* accent lavender */
    glow: '0 16px 28px rgba(208,188,255,0.3)',
    x: [0, 30, 58, 34, -10, -38, -58, -28, 12, 44, 66, 0],
    y: [-30, -8, 18, 44, 56, 32, 2, -30, -48, -20, 8, -30],
    delay: 0.44,
  },
];

export function SplashScreen({ visible }: { visible: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center"
          style={{ background: '#0e0e0e' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] } }}
        >
          <div className="relative flex h-[360px] w-[360px] items-center justify-center">
            {/* Concentric rings */}
            <div className="absolute h-[296px] w-[296px] rounded-full"
                 style={{ border: '1px solid rgba(208,188,255,0.12)', background: 'radial-gradient(circle at top, rgba(208,188,255,0.06), transparent 58%)' }} />
            <div className="absolute h-[224px] w-[224px] rounded-full"
                 style={{ border: '1px solid rgba(79,219,200,0.08)' }} />
            <div className="absolute h-[150px] w-[150px] rounded-full"
                 style={{ border: '1px solid rgba(208,188,255,0.1)' }} />

            {loaderPaths.map((item) => (
              <motion.div
                key={item.size}
                className="absolute rounded-full"
                style={{
                  width: item.size,
                  height: item.size,
                  border: '1px solid rgba(208,188,255,0.15)',
                  background: `radial-gradient(circle at 30% 30%, rgba(208,188,255,0.3), ${item.color})`,
                  boxShadow: item.glow,
                }}
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : {
                        x: item.x,
                        y: item.y,
                        scale: [1, 1.05, 0.96, 1.02, 1],
                        opacity: [0.88, 1, 0.82, 1],
                      }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 6,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: 'loop',
                        ease: 'easeInOut',
                        delay: item.delay,
                      }
                }
              />
            ))}

            <div className="relative z-10 text-center">
              <p className="text-xs uppercase tracking-[0.28em] font-semibold" style={{ color: 'rgba(208,188,255,0.6)' }}>
                Personal wardrobe intelligence
              </p>
              <p className="mt-4 text-[3.2rem] font-extrabold tracking-[-0.08em]"
                 style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}>
                WeaR
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const loaderPaths = [
  {
    size: 148,
    color: 'rgba(143, 150, 255, 0.92)',
    glow: '0 28px 56px rgba(143, 150, 255, 0.28)',
    x: [0, 54, 102, 82, 18, -70, -116, -80, -18, 58, 118, 0],
    y: [-108, -72, -10, 70, 116, 84, 10, -70, -118, -90, -24, -108],
    delay: 0,
  },
  {
    size: 92,
    color: 'rgba(197, 223, 99, 0.88)',
    glow: '0 22px 42px rgba(197, 223, 99, 0.22)',
    x: [14, 58, 84, 50, -8, -62, -88, -48, 20, 62, 92, 14],
    y: [-64, -26, 26, 68, 88, 58, 6, -52, -82, -52, -8, -64],
    delay: 0.22,
  },
  {
    size: 58,
    color: 'rgba(255, 255, 255, 0.92)',
    glow: '0 16px 28px rgba(255, 255, 255, 0.4)',
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
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(244,240,234,0.94)] backdrop-blur-[20px]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] } }}
        >
          <div className="relative flex h-[360px] w-[360px] items-center justify-center">
            <div className="absolute h-[296px] w-[296px] rounded-full border border-white/80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_58%)]" />
            <div className="absolute h-[224px] w-[224px] rounded-full border border-[rgba(24,24,29,0.08)]" />
            <div className="absolute h-[150px] w-[150px] rounded-full border border-[rgba(143,150,255,0.18)]" />

            {loaderPaths.map((item) => (
              <motion.div
                key={item.size}
                className="absolute rounded-full border border-white/78"
                style={{
                  width: item.size,
                  height: item.size,
                  background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.94), ${item.color})`,
                  boxShadow: item.glow,
                }}
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : {
                        x: item.x,
                        y: item.y,
                        scale: [1, 1.05, 0.96, 1.02, 1],
                        opacity: [0.92, 1, 0.88, 1],
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
              <p className="section-kicker">Personal wardrobe intelligence</p>
              <p className="font-display mt-4 text-[3.2rem] tracking-[-0.08em] text-[var(--text)]">WeaR</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

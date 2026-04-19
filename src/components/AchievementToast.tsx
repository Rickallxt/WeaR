import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { Achievement } from '../lib/achievements';
import { Panel } from './Chrome';

/** Slides in from the right when an achievement is unlocked, auto-dismisses after 4s. */
export function AchievementToast({
  achievement,
  onDismiss,
}: {
  achievement: Achievement | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!achievement) return;
    const id = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(id);
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement ? (
        <motion.div
          key={achievement.id}
          className="fixed bottom-20 right-5 z-[160] max-w-[300px]"
          initial={{ opacity: 0, x: 52, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 52, scale: 0.94 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Panel className="flex items-start gap-3 p-4" variant="solid">
            <span className="mt-0.5 shrink-0 text-xl leading-none">{achievement.icon}</span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[0.6rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: 'var(--accent-strong)' }}
              >
                Achievement unlocked
              </p>
              <p
                className="mt-1 text-[0.9rem] font-semibold leading-snug"
                style={{ color: 'var(--text)' }}
              >
                {achievement.title}
              </p>
              <p className="mt-0.5 text-xs leading-5" style={{ color: 'var(--muted)' }}>
                {achievement.description}
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="ml-1 shrink-0 text-lg leading-none transition-opacity hover:opacity-60"
              style={{ color: 'var(--muted)' }}
              aria-label="Dismiss achievement"
            >
              ×
            </button>
          </Panel>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

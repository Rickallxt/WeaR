import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="pb-safe fixed inset-x-0 bottom-0 z-[81] max-h-[90dvh] overflow-y-auto rounded-t-[28px]"
            style={{
              background: 'var(--surface-strong)',
              border: '1px solid var(--panel-border-solid)',
              borderBottom: 'none',
            }}
            initial={reduceMotion ? { opacity: 0 } : { y: '100%', opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.9 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full" style={{ background: 'var(--line)' }} />
            </div>

            {title ? (
              <div className="px-5 pb-3 pt-2" style={{ borderBottom: '1px solid var(--panel-border-solid)' }}>
                <p className="font-display text-[1.1rem] tracking-[-0.03em]" style={{ color: 'var(--text)' }}>{title}</p>
              </div>
            ) : null}

            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

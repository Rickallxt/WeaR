import { AnimatePresence, motion } from 'framer-motion';
import type { WardrobeCategory, WardrobeItem } from '../data/wearData';
import { Panel, SectionKicker, SurfaceBadge } from './Chrome';
import { parseTags, stringifyTags } from '../lib/wardrobeDrafts';

const categories: WardrobeCategory[] = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];

export function ItemReviewModal({
  state,
  onClose,
  onChange,
  onConfirm,
}: {
  state: {
    visible: boolean;
    stage: 'processing' | 'review' | 'error';
    fileName: string;
    imageDataUrl: string;
    draft: WardrobeItem;
    helperText: string;
  };
  onClose: () => void;
  onChange: (patch: Partial<WardrobeItem>) => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {state.visible ? (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(17,18,23,0.2)] p-5 backdrop-blur-[14px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[1040px]"
          >
            <Panel className="max-h-[86vh] overflow-hidden" variant="glass">
              <div className="flex items-center justify-between border-b border-white/70 px-6 py-5">
                <div>
                  <SectionKicker>Wardrobe review</SectionKicker>
                  <p className="mt-2 text-[1.15rem] text-[var(--text)]">
                    {state.stage === 'processing' ? 'Analyzing your upload' : 'Confirm the detected details'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SurfaceBadge tone={state.stage === 'error' ? 'default' : state.draft.detection?.mode === 'openai' ? 'accent' : 'accent-soft'}>
                    {state.stage === 'processing'
                      ? 'Processing'
                      : state.draft.detection?.mode === 'openai'
                        ? 'AI detected'
                        : state.draft.detection?.mode === 'mock'
                          ? 'Auto-guessed'
                          : 'Review'}
                  </SurfaceBadge>
                  <button type="button" onClick={onClose} className="button-secondary text-sm">
                    Close
                  </button>
                </div>
              </div>

              {state.stage === 'processing' ? (
                <div className="grid gap-6 px-6 py-8 xl:grid-cols-[0.92fr_1.08fr]">
                  <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/76 p-3">
                    <img src={state.imageDataUrl} alt={state.fileName} className="aspect-[0.9/1] w-full rounded-[22px] object-cover" />
                  </div>
                  <div className="flex flex-col justify-center gap-5">
                    <div className="flex items-center gap-3">
                      <span className="h-4 w-4 rounded-full bg-[var(--accent)] shadow-[0_0_0_10px_rgba(152,161,255,0.12)]" />
                      <span className="h-3 w-3 rounded-full bg-[var(--accent-2)] shadow-[0_0_0_8px_rgba(200,223,113,0.12)]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.14)]" />
                    </div>
                    <p className="font-display text-[2.3rem] leading-[0.98] tracking-[-0.06em] text-[var(--text)]">
                      Auto-identifying category, color, fit, and material.
                    </p>
                    <p className="max-w-[30rem] text-[1rem] leading-8 text-[var(--muted)]">{state.helperText}</p>
                  </div>
                </div>
              ) : (
                <div className="grid max-h-[calc(86vh-5.5rem)] gap-6 overflow-y-auto px-6 py-6 xl:grid-cols-[0.88fr_1.12fr]">
                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/78 p-3">
                      <img src={state.imageDataUrl} alt={state.fileName} className="aspect-[0.92/1] w-full rounded-[22px] object-cover" />
                    </div>
                    <Panel className="p-5" variant="solid">
                      <SectionKicker>Detected summary</SectionKicker>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <SurfaceBadge tone={state.draft.detection?.mode === 'openai' ? 'accent' : 'default'}>
                          {Math.round((state.draft.detection?.confidence ?? 0.7) * 100)}% confidence
                        </SurfaceBadge>
                        <SurfaceBadge>{state.draft.color}</SurfaceBadge>
                        <SurfaceBadge>{state.draft.material}</SurfaceBadge>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{state.helperText}</p>
                      {state.draft.detection?.mode === 'mock' && (
                        <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
                          This was guessed from the file name. Review all fields before saving.
                        </p>
                      )}
                    </Panel>
                  </div>

                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Item name</span>
                        <input
                          value={state.draft.name}
                          onChange={(event) => onChange({ name: event.target.value })}
                          className="mt-3 h-14 w-full rounded-[20px] border border-[rgba(24,24,29,0.08)] bg-white px-4 text-[var(--text)] outline-none focus:border-[rgba(152,161,255,0.48)]"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Color</span>
                        <input
                          value={state.draft.color}
                          onChange={(event) => onChange({ color: event.target.value })}
                          className="mt-3 h-14 w-full rounded-[20px] border border-[rgba(24,24,29,0.08)] bg-white px-4 text-[var(--text)] outline-none focus:border-[rgba(152,161,255,0.48)]"
                        />
                      </label>
                    </div>

                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Category</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => onChange({ category })}
                            className={`rounded-full border px-4 py-2 text-sm transition duration-300 ${
                              state.draft.category === category
                                ? 'border-[rgba(152,161,255,0.32)] bg-[rgba(152,161,255,0.14)] text-[var(--text)]'
                                : 'border-[rgba(24,24,29,0.08)] bg-white text-[var(--muted)]'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Fit / cut</span>
                        <input
                          value={state.draft.fit}
                          onChange={(event) => onChange({ fit: event.target.value })}
                          className="mt-3 h-14 w-full rounded-[20px] border border-[rgba(24,24,29,0.08)] bg-white px-4 text-[var(--text)] outline-none focus:border-[rgba(152,161,255,0.48)]"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Material</span>
                        <input
                          value={state.draft.material}
                          onChange={(event) => onChange({ material: event.target.value })}
                          className="mt-3 h-14 w-full rounded-[20px] border border-[rgba(24,24,29,0.08)] bg-white px-4 text-[var(--text)] outline-none focus:border-[rgba(152,161,255,0.48)]"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Style note</span>
                      <textarea
                        value={state.draft.styleNote ?? ''}
                        onChange={(event) => onChange({ styleNote: event.target.value })}
                        rows={3}
                        className="mt-3 w-full rounded-[20px] border border-[rgba(24,24,29,0.08)] bg-white px-4 py-4 text-[var(--text)] outline-none focus:border-[rgba(152,161,255,0.48)]"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Tags</span>
                      <input
                        value={stringifyTags(state.draft.tags)}
                        onChange={(event) => onChange({ tags: parseTags(event.target.value) })}
                        className="mt-3 h-14 w-full rounded-[20px] border border-[rgba(24,24,29,0.08)] bg-white px-4 text-[var(--text)] outline-none focus:border-[rgba(152,161,255,0.48)]"
                      />
                    </label>

                    <div className="flex flex-wrap justify-end gap-3 pt-2">
                      <button type="button" onClick={onClose} className="button-secondary text-sm">
                        Cancel
                      </button>
                      <button type="button" onClick={onConfirm} className="button-primary text-sm">
                        Save to wardrobe
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Panel>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

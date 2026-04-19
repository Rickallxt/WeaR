import { AnimatePresence, motion } from 'framer-motion';
import type { WardrobeCategory, WardrobeItem } from '../data/wearData';
import { Panel, SectionKicker, SurfaceBadge } from './Chrome';
import { parseTags, stringifyTags } from '../lib/wardrobeDrafts';
import { readFileAsDataUrl } from '../lib/fileData';

const categories: WardrobeCategory[] = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];

const inputClass =
  'mt-3 h-14 w-full rounded-[20px] border border-[rgba(24,24,29,0.08)] px-4 text-[var(--text)] outline-none focus:border-[rgba(152,161,255,0.48)]';
const inputStyle = { background: 'var(--surface-high)' } as const;

function buildGuidanceText(mode: string | undefined, confidence: number): string | null {
  if (mode === 'mock') {
    return 'Auto-guessed from file name. Check all fields before saving — especially category and color.';
  }
  if ((mode === 'local' || mode === 'openai') && confidence < 0.7) {
    return 'Lower confidence detection. Review category, color, and fit carefully before saving.';
  }
  return null;
}

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
  const mode = state.draft.detection?.mode;
  const confidence = state.draft.detection?.confidence ?? 0;
  const guidanceText = buildGuidanceText(mode, confidence);

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
              <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: 'var(--line)' }}>
                <div>
                  <SectionKicker>Wardrobe review</SectionKicker>
                  <p className="mt-2 text-[1.15rem] text-[var(--text)]">
                    {state.stage === 'processing' ? 'Analyzing your upload' : 'Confirm the detected details'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SurfaceBadge
                    tone={state.stage === 'error' ? 'default' : mode === 'local' || mode === 'openai' ? 'accent' : 'accent-soft'}
                  >
                    {state.stage === 'processing'
                      ? 'Processing'
                      : mode === 'local' || mode === 'openai'
                        ? 'Local AI detected'
                        : mode === 'mock'
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
                  <div className="overflow-hidden rounded-[28px] p-3" style={{ border: '1px solid var(--line)', background: 'var(--surface)' }}>
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
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-[28px] p-3" style={{ border: '1px solid var(--line)', background: 'var(--surface)' }}>
                      <img src={state.imageDataUrl} alt={state.fileName} className="aspect-[0.92/1] w-full rounded-[22px] object-cover" />
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(24,24,29,0.08)] px-4 py-2 text-sm text-[var(--text)] transition duration-300 hover:-translate-y-[1px]" style={{ background: 'var(--surface-high)' }}>
                      Replace photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const url = await readFileAsDataUrl(file);
                          onChange({ imageDataUrl: url });
                          event.target.value = '';
                        }}
                      />
                    </label>

                    <Panel className="p-5" variant="solid">
                      <SectionKicker>Detected summary</SectionKicker>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <SurfaceBadge tone={mode === 'local' || mode === 'openai' ? 'accent' : 'default'}>
                          {Math.round(confidence * 100)}% confidence
                        </SurfaceBadge>
                        <SurfaceBadge>{state.draft.color}</SurfaceBadge>
                        <SurfaceBadge>{state.draft.material}</SurfaceBadge>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{state.helperText}</p>
                    </Panel>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">Identity</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted-strong)]">Item name</span>
                          <input
                            value={state.draft.name}
                            onChange={(event) => onChange({ name: event.target.value })}
                            className={inputClass}
                            style={inputStyle}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted-strong)]">Color</span>
                          <input
                            value={state.draft.color}
                            onChange={(event) => onChange({ color: event.target.value })}
                            className={inputClass}
                            style={inputStyle}
                          />
                        </label>
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted-strong)]">Category</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {categories.map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => onChange({ category })}
                              className={`rounded-full border px-4 py-2 text-sm transition duration-300 ${
                                state.draft.category === category
                                  ? 'border-[rgba(152,161,255,0.32)] bg-[rgba(152,161,255,0.14)] text-[var(--text)]'
                                  : 'border-[rgba(24,24,29,0.08)] text-[var(--muted)]'
                              }`}
                              style={state.draft.category !== category ? { background: 'var(--surface-high)' } : undefined}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[rgba(24,24,29,0.06)]" />

                    <div className="space-y-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">Fit & fabric</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted-strong)]">Fit / cut</span>
                          <input
                            value={state.draft.fit}
                            onChange={(event) => onChange({ fit: event.target.value })}
                            className={inputClass}
                            style={inputStyle}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted-strong)]">Material</span>
                          <input
                            value={state.draft.material}
                            onChange={(event) => onChange({ material: event.target.value })}
                            className={inputClass}
                            style={inputStyle}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="border-t border-[rgba(24,24,29,0.06)]" />

                    <div className="space-y-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">Style context</p>
                      <label className="block">
                        <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted-strong)]">Style note</span>
                        <textarea
                          value={state.draft.styleNote ?? ''}
                          onChange={(event) => onChange({ styleNote: event.target.value })}
                          rows={3}
                          className="mt-3 w-full rounded-[20px] border border-[rgba(24,24,29,0.08)] px-4 py-4 text-[var(--text)] outline-none focus:border-[rgba(152,161,255,0.48)]"
                          style={inputStyle}
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted-strong)]">Tags</span>
                        <input
                          value={stringifyTags(state.draft.tags)}
                          onChange={(event) => onChange({ tags: parseTags(event.target.value) })}
                          className={inputClass}
                          style={inputStyle}
                        />
                        <p className="mt-2 text-xs text-[var(--muted)]">Comma-separated. e.g. Evening, Layering hero</p>
                      </label>
                    </div>

                    {guidanceText ? (
                      <div className="rounded-[20px] border border-[rgba(200,223,113,0.4)] bg-[rgba(200,223,113,0.10)] px-4 py-3">
                        <p className="text-sm leading-7 text-[var(--text)]">{guidanceText}</p>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap justify-end gap-3 pt-1">
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

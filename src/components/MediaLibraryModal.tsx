import { AnimatePresence, motion } from 'framer-motion';
import type { MediaAsset } from '../data/wearData';
import { ItemArtwork, Panel, SectionKicker, SurfaceBadge } from './Chrome';

export function MediaLibraryModal({
  open,
  title,
  mediaAssets,
  selectedIds,
  onToggle,
  onClose,
  onConfirm,
  onDelete,
}: {
  open: boolean;
  title: string;
  mediaAssets: MediaAsset[];
  selectedIds: string[];
  onToggle: (mediaAssetId: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  onDelete?: (mediaAssetId: string) => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[135] flex items-center justify-center bg-[rgba(17,18,23,0.18)] p-5 backdrop-blur-[16px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[1180px]"
          >
            <Panel className="max-h-[88vh] overflow-hidden" variant="glass">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b px-6 py-5" style={{ borderColor: 'var(--line)' }}>
                <div>
                  <SectionKicker>Upload library</SectionKicker>
                  <h2 className="mt-3 text-[1.5rem] tracking-[-0.04em] text-[var(--text)]">{title}</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <SurfaceBadge tone="accent-soft">{mediaAssets.length} assets</SurfaceBadge>
                  <button type="button" onClick={onClose} className="button-secondary text-sm">
                    Close
                  </button>
                  <button type="button" onClick={onConfirm} className="button-primary text-sm" disabled={selectedIds.length === 0}>
                    Use selected
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(88vh-6rem)] overflow-y-auto px-6 py-6">
                {mediaAssets.length === 0 ? (
                  <Panel className="px-6 py-10 text-center" variant="solid">
                    <p className="text-[1rem] text-[var(--text)]">No uploaded photos yet.</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                      Upload pieces from wardrobe or generate to start building a reusable attachment library.
                    </p>
                  </Panel>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {mediaAssets.map((asset) => {
                      const selected = selectedIds.includes(asset.id);
                      return (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => onToggle(asset.id)}
                          className={`rounded-[28px] border p-3 text-left transition duration-300 ${
                            selected
                              ? 'border-[rgba(152,161,255,0.36)] bg-[rgba(152,161,255,0.08)] shadow-[0_20px_50px_rgba(17,18,23,0.08)]'
                              : 'hover:-translate-y-[2px]'
                          }`}
                          style={!selected ? { border: '1px solid var(--line)', background: 'var(--surface)' } : undefined}
                        >
                          <ItemArtwork
                            palette="from-[#ece3d8] via-[#fffaf4] to-[#dfe6ff]"
                            imageUrl={asset.previewUrl}
                            label={asset.fileName}
                            compact
                          />
                          <div className="mt-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <SurfaceBadge tone={asset.linkedItemId ? 'accent' : 'default'}>
                                {asset.linkedItemId ? 'Linked' : 'Unlinked'}
                              </SurfaceBadge>
                              <SurfaceBadge>{asset.kind === 'generated-look' ? 'Generated' : 'Upload'}</SurfaceBadge>
                            </div>
                            <div>
                              <p className="truncate text-[0.98rem] text-[var(--text)]">{asset.fileName}</p>
                              <p className="mt-2 text-sm text-[var(--muted)]">
                                {new Date(asset.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {onDelete ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onDelete(asset.id);
                                }}
                                className="button-ghost w-full text-sm"
                              >
                                Remove asset
                              </button>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Panel>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

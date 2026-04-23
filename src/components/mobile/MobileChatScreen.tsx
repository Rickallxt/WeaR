import { useEffect, useRef, useState } from 'react';
import type { UserProfile, WardrobeItem } from '../../data/wearData';
import { resolveWardrobeImageSrc } from '../../data/wearData';
import type { ChatAttachment, ChatMessage } from '../../lib/chatState';
import { MaterialIcon } from '../Chrome';

/* ─── Wardrobe picker overlay ───────────────────────────────────── */
function WardrobePicker({
  wardrobe,
  onConfirm,
  onClose,
}: {
  wardrobe: WardrobeItem[];
  onConfirm: (items: WardrobeItem[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const selectedItems = wardrobe.filter((item) => selected.has(item.id));

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ background: 'var(--bg)', paddingTop: 'var(--safe-top, 0px)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <div>
          <h2
            className="text-lg font-bold"
            style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}
          >
            Choose from Wardrobe
          </h2>
          {selected.size > 0 && (
            <p className="mt-0.5 text-xs" style={{ color: '#4fdbc8' }}>
              {selected.size} selected
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
          style={{ background: 'var(--surface-high)' }}
          aria-label="Close"
        >
          <MaterialIcon name="close" size={20} style={{ color: '#cbc3d7' }} />
        </button>
      </div>

      {/* Body */}
      {wardrobe.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(208,188,255,0.1)', border: '1px solid rgba(208,188,255,0.2)' }}
          >
            <MaterialIcon name="checkroom" size={32} style={{ color: '#d0bcff' }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}>
            Your wardrobe is empty
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#958ea0' }}>
            Upload clothing photos from the Closet tab to use them here.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-6 py-3 text-sm font-semibold transition-all active:scale-95"
            style={{
              background: 'rgba(208,188,255,0.15)',
              color: '#d0bcff',
              border: '1px solid rgba(208,188,255,0.2)',
            }}
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              {wardrobe.map((item) => {
                const src = resolveWardrobeImageSrc(item);
                const active = selected.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="relative text-left transition-all active:scale-95"
                    aria-pressed={active}
                  >
                    <div
                      className="relative overflow-hidden rounded-2xl"
                      style={{
                        aspectRatio: '1',
                        background: 'var(--surface)',
                        outline: active ? '2px solid #d0bcff' : '2px solid transparent',
                        outlineOffset: '2px',
                      }}
                    >
                      {src ? (
                        <img src={src} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full" style={{ background: 'var(--surface-high)' }} />
                      )}
                      {active && (
                        <div
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full"
                          style={{ background: '#d0bcff' }}
                        >
                          <MaterialIcon name="check" size={14} style={{ color: '#23005c' }} />
                        </div>
                      )}
                    </div>
                    <p
                      className="mt-1.5 line-clamp-1 text-xs font-medium"
                      style={{ color: active ? '#d0bcff' : '#cbc3d7' }}
                    >
                      {item.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm bar */}
          <div
            className="flex-shrink-0 px-4 pt-3"
            style={{
              borderTop: '1px solid var(--line)',
              paddingBottom: 'calc(max(var(--safe-bottom, 0px), 0.75rem) + 0.75rem)',
            }}
          >
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={() => onConfirm(selectedItems)}
              className="w-full py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
              style={{
                background:
                  selected.size > 0
                    ? 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)'
                    : 'var(--surface-high)',
                color: selected.size > 0 ? '#23005c' : '#6b6478',
                borderRadius: '9999px',
              }}
            >
              {selected.size > 0
                ? `Add ${selected.size} item${selected.size !== 1 ? 's' : ''}`
                : 'Select items to add'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Typing indicator ───────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: 'rgba(208,188,255,0.15)', border: '1px solid rgba(208,188,255,0.2)' }}
      >
        <MaterialIcon name="auto_awesome" size={16} style={{ color: '#d0bcff' }} />
      </div>
      <div
        className="flex items-center gap-1.5 rounded-3xl rounded-tl-sm px-4 py-3"
        style={{ background: 'var(--surface-strong)', border: '1px solid var(--line)' }}
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-full"
            style={{ background: '#d0bcff', animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── MobileChatScreen ───────────────────────────────────────────── */
export function MobileChatScreen({
  profile: _profile,
  wardrobe,
  messages,
  draft,
  attachments,
  isTyping,
  onDraftChange,
  onAttachmentsChange,
  onSend,
  onUploadFile,
}: {
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  messages: ChatMessage[];
  draft: string;
  attachments: ChatAttachment[];
  isTyping: boolean;
  onDraftChange: (v: string) => void;
  onAttachmentsChange: (attachments: ChatAttachment[]) => void;
  onSend: () => void;
  onUploadFile: (file: File) => void;
}) {
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showWardrobePicker, setShowWardrobePicker] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  /* Scroll to bottom on new messages / typing indicator */
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  /* Focus input on mount */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      const previewUrl = ev.target?.result as string;
      onAttachmentsChange([
        ...attachments,
        { id: `img-${Date.now()}`, type: 'image', label: file.name, previewUrl, file },
      ]);
      onUploadFile(file);
    };
    reader.readAsDataURL(file);
  }

  function handleWardrobeConfirm(items: WardrobeItem[]) {
    const existingIds = new Set(attachments.map((a) => a.id));
    const newOnes: ChatAttachment[] = items
      .map((item) => ({
        id: `wardrobe-${item.id}`,
        type: 'wardrobe-item' as const,
        label: item.name,
        previewUrl: resolveWardrobeImageSrc(item) ?? '',
        wardrobeItemId: item.id,
      }))
      .filter((a) => !existingIds.has(a.id));
    onAttachmentsChange([...attachments, ...newOnes]);
    setShowWardrobePicker(false);
  }

  function removeAttachment(id: string) {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  }

  function handleAttachAction(kind: 'camera' | 'gallery' | 'wardrobe') {
    if (kind === 'camera') {
      cameraRef.current?.click();
    } else if (kind === 'gallery') {
      uploadRef.current?.click();
    } else {
      setShowWardrobePicker(true);
    }

    setShowAttachMenu(false);
  }

  const canSend = draft.trim().length > 0 || attachments.length > 0;

  /* Bottom offset shared by page padding + input bar position */
  const bottomClearance =
    'calc(var(--tab-bar-height, 5rem) + max(var(--safe-bottom, 0px), 0.5rem) + 0.5rem)';

  return (
    <>
      {/* ── Page content area ── */}
      <div
        style={{
          minHeight: '100dvh',
          paddingTop: 'calc(var(--mobile-header-height) + var(--safe-top, 0px))',
          paddingBottom: `calc(${bottomClearance} + 4.5rem)`,
        }}
      >
        <div
          ref={listRef}
          className="overflow-y-auto px-4 py-4"
          style={{ scrollBehavior: 'smooth', height: '100%' }}
        >
          {messages.length === 0 && !isTyping ? (
            /* Empty state */
            <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 px-8 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: 'rgba(208,188,255,0.1)',
                  border: '1px solid rgba(208,188,255,0.2)',
                  boxShadow: '0 0 32px rgba(208,188,255,0.08)',
                }}
              >
                <MaterialIcon name="auto_awesome" size={32} style={{ color: '#d0bcff' }} />
              </div>
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}
                >
                  Your personal stylist
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: '#958ea0' }}>
                  Tell me about your day, an event, or just ask what to wear — I'll build a look from your wardrobe.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {['I have a dinner tonight', 'Need a casual Monday look', 'Client meeting tomorrow'].map(
                  (prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        onDraftChange(prompt);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full px-4 py-2 text-xs font-medium transition-all active:scale-95"
                      style={{
                        background: 'var(--surface)',
                        color: '#cbc3d7',
                        border: '1px solid rgba(73,68,84,0.3)',
                      }}
                    >
                      {prompt}
                    </button>
                  ),
                )}
              </div>
            </div>
          ) : (
            /* Message thread */
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: 'rgba(208,188,255,0.15)',
                        border: '1px solid rgba(208,188,255,0.2)',
                      }}
                    >
                      <MaterialIcon name="auto_awesome" size={16} style={{ color: '#d0bcff' }} />
                    </div>
                  )}

                  <div
                    className="flex max-w-[80%] flex-col gap-2"
                    style={{ alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                  >
                    {/* Attachment thumbnails */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className={`flex flex-wrap gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="overflow-hidden rounded-2xl"
                            style={{ width: '5rem', height: '5rem', background: 'var(--surface-high)' }}
                          >
                            {att.previewUrl ? (
                              <img src={att.previewUrl} alt={att.label} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <MaterialIcon name="checkroom" size={20} style={{ color: '#d0bcff' }} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text bubble */}
                    {msg.content && (
                      <div
                        className="rounded-3xl px-4 py-3 text-sm leading-relaxed"
                        style={
                          msg.role === 'user'
                            ? {
                                background: 'rgba(208,188,255,0.18)',
                                border: '1px solid rgba(208,188,255,0.28)',
                                color: '#e5e2e1',
                                borderBottomRightRadius: '0.5rem',
                              }
                            : {
                                background: 'var(--surface-strong)',
                                border: '1px solid var(--line)',
                                color: '#e5e2e1',
                                borderBottomLeftRadius: '0.5rem',
                              }
                        }
                      >
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && <TypingIndicator />}
            </div>
          )}
        </div>
      </div>

      {/* ── Floating input bar ── */}
      <div
        className="pointer-events-none fixed left-0 w-full px-4"
        style={{ bottom: bottomClearance, zIndex: 40 }}
      >
        <div className="pointer-events-auto mx-auto max-w-2xl">
          {/* Attachment strip */}
          {attachments.length > 0 && (
            <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="relative flex-shrink-0 overflow-hidden rounded-xl"
                  style={{ width: '3.5rem', height: '3.5rem', background: 'var(--surface-high)' }}
                >
                  {att.previewUrl ? (
                    <img src={att.previewUrl} alt={att.label} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <MaterialIcon name="checkroom" size={18} style={{ color: '#d0bcff' }} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ background: 'rgba(14,14,14,0.85)' }}
                    aria-label={`Remove ${att.label}`}
                  >
                    <MaterialIcon name="close" size={12} style={{ color: '#e5e2e1' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input row */}
          <div
            className="flex items-center gap-1 rounded-2xl p-2"
            style={{
              background: 'rgba(28,27,27,0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(73,68,84,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <button
              type="button"
              onClick={() => setShowAttachMenu(true)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 hover:bg-[rgba(208,188,255,0.1)]"
              style={{ color: '#cbc3d7' }}
              aria-label="Add attachment"
            >
              <MaterialIcon name="add_circle" size={22} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && canSend) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Ask the Stylist..."
              className="flex-grow bg-transparent text-sm outline-none border-none px-2"
              style={{ color: '#e5e2e1', minWidth: 0 }}
            />

            <button
              type="button"
              onClick={() => { if (canSend) onSend(); }}
              disabled={!canSend}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: canSend ? '#d0bcff' : 'rgba(208,188,255,0.2)',
                color: canSend ? '#3c0091' : '#d0bcff',
                boxShadow: canSend ? '0 0 15px rgba(208,188,255,0.4)' : 'none',
              }}
              aria-label="Send"
            >
              <MaterialIcon name="arrow_upward" size={20} />
            </button>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* ── Attach menu sheet ── */}
      {showAttachMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowAttachMenu(false)}
          />
          <div
            className="fixed bottom-0 left-0 z-[51] w-full rounded-t-3xl px-5 pt-5"
            style={{
              background: 'var(--surface-strong)',
              border: '1px solid var(--line)',
              paddingBottom: `calc(var(--tab-bar-height, 5rem) + max(var(--safe-bottom, 0px), 0.5rem) + 0.5rem)`,
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold" style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}>
                Add to message
              </h3>
              <button
                type="button"
                onClick={() => setShowAttachMenu(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: 'var(--surface-high)' }}
              >
                <MaterialIcon name="close" size={18} style={{ color: '#cbc3d7' }} />
              </button>
            </div>

            <div className="flex flex-col gap-2 pb-2">
              {[
                {
                  icon: 'camera_alt',
                  label: 'Take a Photo',
                  sub: 'Use your camera',
                  kind: 'camera' as const,
                },
                {
                  icon: 'photo_library',
                  label: 'Upload from Gallery',
                  sub: 'Choose an image',
                  kind: 'gallery' as const,
                },
                {
                  icon: 'checkroom',
                  label: 'Choose from Wardrobe',
                  sub: `${wardrobe.length} item${wardrobe.length !== 1 ? 's' : ''} available`,
                  kind: 'wardrobe' as const,
                },
              ].map(({ icon, label, sub, kind }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleAttachAction(kind)}
                  className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-95"
                  style={{ background: 'var(--surface-high)' }}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(208,188,255,0.12)', border: '1px solid rgba(208,188,255,0.18)' }}
                  >
                    <MaterialIcon name={icon} size={20} style={{ color: '#d0bcff' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#e5e2e1' }}>{label}</p>
                    <p className="text-xs" style={{ color: '#958ea0' }}>{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Wardrobe picker ── */}
      {showWardrobePicker && (
        <WardrobePicker
          wardrobe={wardrobe}
          onConfirm={handleWardrobeConfirm}
          onClose={() => setShowWardrobePicker(false)}
        />
      )}
    </>
  );
}
